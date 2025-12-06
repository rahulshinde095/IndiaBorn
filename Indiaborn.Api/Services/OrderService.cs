using Indiaborn.Api.Configuration;
using Indiaborn.Api.DTOs;
using Indiaborn.Api.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace Indiaborn.Api.Services;

public class OrderService
{
    private readonly IMongoCollection<Order> _orders;
    private readonly ProductService _productService;
    private readonly PaymentService _paymentService;
    private readonly NotificationService _notificationService;
    private readonly InvoiceService _invoiceService;
    private readonly ILogger<OrderService> _logger;
    private readonly StripeSettings _stripeSettings;

    public OrderService(
        Data.MongoDbContext context,
        ProductService productService,
        PaymentService paymentService,
        NotificationService notificationService,
        InvoiceService invoiceService,
        IOptions<MongoSettings> mongoSettings,
        IOptions<StripeSettings> stripeSettings,
        ILogger<OrderService> logger)
    {
        _orders = context.GetCollection<Order>(mongoSettings.Value.OrdersCollection);
        _productService = productService;
        _paymentService = paymentService;
        _notificationService = notificationService;
        _invoiceService = invoiceService;
        _stripeSettings = stripeSettings.Value;
        _logger = logger;
    }

    public async Task<OrderSummaryResponse> CreateOrderAsync(CreateOrderRequest request, string? userId, CancellationToken token = default)
    {
        var productMap = await _productService.GetByIdsAsync(request.Items.Select(i => i.ProductId), token);
        var items = new List<OrderItem>();
        decimal subtotal = 0;

        foreach (var item in request.Items)
        {
            if (!productMap.TryGetValue(item.ProductId, out var product))
            {
                throw new InvalidOperationException($"Product {item.ProductId} not found.");
            }

            if (product.InventoryCount < item.Quantity)
            {
                throw new InvalidOperationException($"Not enough inventory for {product.Name}.");
            }

            var price = product.IsOnSale && product.SalePrice.HasValue ? product.SalePrice.Value : product.Price;
            items.Add(new OrderItem
            {
                ProductId = product.Id,
                Name = product.Name,
                Quantity = item.Quantity,
                UnitPrice = price,
                ImageUrl = product.Images.FirstOrDefault(i => i.IsPrimary)?.Url ?? product.Images.FirstOrDefault()?.Url
            });

            subtotal += item.Quantity * price;
        }

        var order = new Order
        {
            UserId = userId ?? string.Empty,
            ReferenceCode = $"IB-{DateTime.UtcNow:yyyyMMddHHmmss}",
            Items = items,
            Shipping = request.Shipping,
            Contact = new ContactInfo
            {
                Email = request.Email,
                PhoneNumber = request.PhoneNumber,
                WhatsAppNumber = request.WhatsAppNumber,
                MessengerId = request.MessengerId
            },
            Subtotal = subtotal,
            ShippingFee = request.ShippingFee,
            Taxes = request.Taxes,
            Status = OrderStatus.PaymentPending,
            PaymentStatus = PaymentStatus.Pending,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _orders.InsertOneAsync(order, cancellationToken: token);

        var paymentIntent = await _paymentService.CreatePaymentIntentAsync(order, token);
        order.PaymentIntentId = paymentIntent.Id;
        await UpdateAsync(order, token);

        return new OrderSummaryResponse
        {
            Order = order,
            ClientSecret = paymentIntent.ClientSecret
        };
    }

    public async Task<Order> CreateTestOrderAsync(CreateOrderRequest request, string? userId, CancellationToken token = default)
    {
        var productMap = await _productService.GetByIdsAsync(request.Items.Select(i => i.ProductId), token);
        var items = new List<OrderItem>();
        decimal subtotal = 0;

        foreach (var item in request.Items)
        {
            if (!productMap.TryGetValue(item.ProductId, out var product))
            {
                throw new InvalidOperationException($"Product {item.ProductId} not found.");
            }

            if (product.InventoryCount < item.Quantity)
            {
                throw new InvalidOperationException($"Not enough inventory for {product.Name}.");
            }

            var price = product.IsOnSale && product.SalePrice.HasValue ? product.SalePrice.Value : product.Price;
            items.Add(new OrderItem
            {
                ProductId = product.Id,
                Name = product.Name,
                Quantity = item.Quantity,
                UnitPrice = price,
                ImageUrl = product.Images.FirstOrDefault(i => i.IsPrimary)?.Url ?? product.Images.FirstOrDefault()?.Url
            });

            subtotal += item.Quantity * price;
        }

        var order = new Order
        {
            UserId = userId ?? string.Empty,
            ReferenceCode = $"IB-{DateTime.UtcNow:yyyyMMddHHmmss}",
            Items = items,
            Shipping = request.Shipping,
            Contact = new ContactInfo
            {
                Email = request.Email,
                PhoneNumber = request.PhoneNumber,
                WhatsAppNumber = request.WhatsAppNumber,
                MessengerId = request.MessengerId
            },
            Subtotal = subtotal,
            ShippingFee = request.ShippingFee,
            Taxes = request.Taxes,
            Status = OrderStatus.Paid,
            PaymentStatus = PaymentStatus.Captured,
            PaymentIntentId = $"test_{Guid.NewGuid():N}",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        // Generate invoice (skip notifications for test orders)
        order.InvoiceUrl = await _invoiceService.GenerateInvoiceAsync(order, token);
        
        await _orders.InsertOneAsync(order, cancellationToken: token);
        
        return order;
    }

    public async Task<Order?> GetByPaymentIntentAsync(string paymentIntentId, CancellationToken token = default)
        => await _orders.Find(o => o.PaymentIntentId == paymentIntentId).FirstOrDefaultAsync(token);

    public async Task<Order?> GetByIdAsync(string id, CancellationToken token = default)
        => await _orders.Find(o => o.Id == id).FirstOrDefaultAsync(token);

    public async Task<Order?> GetByReferenceCodeAsync(string referenceCode, CancellationToken token = default)
        => await _orders.Find(o => o.ReferenceCode == referenceCode).FirstOrDefaultAsync(token);

    public async Task<List<Order>> GetHistoryByEmailAsync(string email, CancellationToken token = default)
        => await _orders.Find(o => o.Contact.Email == email)
            .SortByDescending(o => o.CreatedAt)
            .ToListAsync(token);

    public async Task<List<Order>> GetAllAsync(CancellationToken token = default)
        => await _orders.Find(Builders<Order>.Filter.Empty)
            .SortByDescending(o => o.CreatedAt)
            .ToListAsync(token);

    public async Task<Order?> CompleteOrderAsync(string orderId, CancellationToken token = default)
    {
        var order = await GetByIdAsync(orderId, token);
        if (order == null) return null;
        return await FinalizeOrderAsync(order, token);
    }

    public async Task<Order?> CompleteOrderByPaymentIntentAsync(string orderId, string paymentIntentId, CancellationToken token = default)
    {
        var order = await GetByIdAsync(orderId, token);
        if (order == null || !string.Equals(order.PaymentIntentId, paymentIntentId, StringComparison.Ordinal))
        {
            _logger.LogWarning("Order completion validation failed for {OrderId}", orderId);
            return null;
        }

        return await FinalizeOrderAsync(order, token);
    }

    public async Task<Order?> UpdateStatusAsync(string orderId, OrderStatus status, CancellationToken token = default)
    {
        var update = Builders<Order>.Update
            .Set(o => o.Status, status)
            .Set(o => o.UpdatedAt, DateTime.UtcNow);

        return await _orders.FindOneAndUpdateAsync<Order, Order>(
            o => o.Id == orderId,
            update,
            new FindOneAndUpdateOptions<Order, Order> { ReturnDocument = ReturnDocument.After },
            token);
    }

    public async Task UpdateAsync(Order order, CancellationToken token = default)
        => await _orders.ReplaceOneAsync(o => o.Id == order.Id, order, cancellationToken: token);

    private async Task<Order> FinalizeOrderAsync(Order order, CancellationToken token)
    {
        order.Status = OrderStatus.Paid;
        order.PaymentStatus = PaymentStatus.Captured;
        order.UpdatedAt = DateTime.UtcNow;
        order.InvoiceUrl = await _invoiceService.GenerateInvoiceAsync(order, token);
        await UpdateAsync(order, token);
        await _notificationService.SendOrderNotificationsAsync(order, token);
        return order;
    }
}

