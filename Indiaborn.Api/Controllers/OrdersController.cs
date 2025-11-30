using Indiaborn.Api.DTOs;
using Indiaborn.Api.Models;
using Indiaborn.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Indiaborn.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    private readonly OrderService _orderService;

    public OrdersController(OrderService orderService)
    {
        _orderService = orderService;
    }

    [HttpPost]
    public async Task<ActionResult<OrderSummaryResponse>> CreateOrder(CreateOrderRequest request, CancellationToken token)
    {
        var userId = User?.Identity?.IsAuthenticated == true ? User.FindFirst("sub")?.Value : null;
        var summary = await _orderService.CreateOrderAsync(request, userId, token);
        return CreatedAtAction(nameof(GetOrderById), new { id = summary.Order.Id }, summary);
    }

    [Authorize]
    [HttpGet("{id}")]
    public async Task<ActionResult<Order>> GetOrderById(string id, CancellationToken token)
    {
        var order = await _orderService.GetByIdAsync(id, token);
        if (order is null) return NotFound();

        var userEmail = User.FindFirst("email")?.Value;
        if (User.IsInRole(nameof(UserRole.Admin)) || order.Contact.Email.Equals(userEmail, StringComparison.OrdinalIgnoreCase))
        {
            return order;
        }

        return Forbid();
    }

    [HttpGet("history")]
    public async Task<ActionResult<List<Order>>> GetHistory([FromQuery] string email, CancellationToken token)
    {
        if (string.IsNullOrWhiteSpace(email)) return BadRequest("Email is required.");
        return await _orderService.GetHistoryByEmailAsync(email, token);
    }

    [Authorize(Roles = nameof(UserRole.Admin))]
    [HttpPost("{id}/complete")]
    public async Task<ActionResult<Order>> CompleteOrder(string id, CancellationToken token)
    {
        var order = await _orderService.CompleteOrderAsync(id, token);
        return order is null ? NotFound() : order;
    }

    [HttpPost("confirm")]
    public async Task<ActionResult<Order>> ConfirmOrder(ConfirmOrderRequest request, CancellationToken token)
    {
        var order = await _orderService.CompleteOrderByPaymentIntentAsync(request.OrderId, request.PaymentIntentId, token);
        return order is null ? NotFound() : order;
    }

    [HttpPost("test")]
    public async Task<ActionResult<Order>> CreateTestOrder(CreateOrderRequest request, CancellationToken token)
    {
        try
        {
            // Demo mode - create order without payment
            var userId = User?.Identity?.IsAuthenticated == true ? User.FindFirst("sub")?.Value : null;
            var order = await _orderService.CreateTestOrderAsync(request, userId, token);
            
            return CreatedAtAction(nameof(GetOrderById), new { id = order.Id }, order);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Test order error: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
            return StatusCode(500, new { message = ex.Message, details = ex.InnerException?.Message });
        }
    }

    [Authorize(Roles = nameof(UserRole.Admin))]
    [HttpPatch("{id}/status")]
    public async Task<ActionResult<Order>> UpdateStatus(string id, [FromQuery] OrderStatus status, CancellationToken token)
    {
        var updated = await _orderService.UpdateStatusAsync(id, status, token);
        return updated is null ? NotFound() : updated;
    }

    [Authorize(Roles = nameof(UserRole.Admin))]
    [HttpGet]
    public async Task<ActionResult<List<Order>>> GetOrders(CancellationToken token)
        => await _orderService.GetAllAsync(token);

    [HttpGet("{id}/invoice")]
    public async Task<IActionResult> DownloadInvoice(string id, CancellationToken token)
    {
        var order = await _orderService.GetByIdAsync(id, token);
        if (order is null) return NotFound("Order not found");
        
        if (string.IsNullOrEmpty(order.InvoiceUrl))
            return NotFound("Invoice not generated for this order");

        var invoiceFileName = Path.GetFileName(order.InvoiceUrl);
        var invoicePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "invoices", invoiceFileName);
        
        if (!System.IO.File.Exists(invoicePath))
            return NotFound("Invoice file not found");

        var fileBytes = await System.IO.File.ReadAllBytesAsync(invoicePath, token);
        return File(fileBytes, "application/pdf", invoiceFileName);
    }
}

