using Indiaborn.Api.Models;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace Indiaborn.Api.Services;

public class InvoiceService
{
    private readonly IWebHostEnvironment _env;

    public InvoiceService(IWebHostEnvironment env)
    {
        _env = env;
        QuestPDF.Settings.License = LicenseType.Community;
    }

    public async Task<string> GenerateInvoiceAsync(Order order, CancellationToken token = default)
    {
        // Use /tmp directory for cloud deployments (writable), fallback to wwwroot for local dev
        var invoiceDir = Path.Combine("/tmp", "invoices");
        var webRoot = _env.WebRootPath ?? Path.Combine(AppContext.BaseDirectory, "wwwroot");
        
        // Fallback to local wwwroot if /tmp doesn't exist (Windows development)
        if (!Directory.Exists("/tmp"))
        {
            invoiceDir = Path.Combine(webRoot, "invoices");
        }
        
        Directory.CreateDirectory(invoiceDir);

        var fileName = $"{order.ReferenceCode}.pdf";
        var filePath = Path.Combine(invoiceDir, fileName);

        // Load logo image if exists
        byte[]? logoBytes = null;
        var logoPath = Path.Combine(webRoot, "assets", "brand-logo.jpeg");
        if (File.Exists(logoPath))
        {
            logoBytes = await File.ReadAllBytesAsync(logoPath, token);
        }

        await Task.Run(() => BuildDocument(order, logoBytes).GeneratePdf(filePath), token);
        
        // Return relative URL path (note: /tmp files won't be web-accessible, this is just for reference)
        return $"/invoices/{fileName}";
    }

    private static Document BuildDocument(Order order, byte[]? logoBytes)
        => Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Margin(40);
                
                // Header with logo if available
                page.Header().Row(row =>
                {
                    if (logoBytes != null)
                    {
                        row.ConstantItem(60).Image(logoBytes).FitWidth();
                        row.RelativeItem().PaddingLeft(10).AlignMiddle()
                            .Text("Indiaborn™")
                            .SemiBold().FontSize(24).FontColor(Colors.Grey.Darken2);
                    }
                    else
                    {
                        row.RelativeItem().Text("Indiaborn™")
                            .SemiBold().FontSize(24).FontColor(Colors.Grey.Darken2);
                    }
                });

                page.Content().Column(column =>
                {
                    column.Spacing(15);
                    column.Item().Text($"Invoice: {order.ReferenceCode}").Bold();
                    column.Item().Text($"Date: {order.CreatedAt:dd MMM yyyy}");
                    column.Item().Text($"Customer: {order.Shipping.FullName}");
                    column.Item().Text($"Email: {order.Contact.Email}");

                    column.Item().Table(table =>
                    {
                        table.ColumnsDefinition(columns =>
                        {
                            columns.RelativeColumn();
                            columns.ConstantColumn(60);
                            columns.ConstantColumn(80);
                        });

                        table.Header(header =>
                        {
                            header.Cell().Text("Product").Bold();
                            header.Cell().Text("Qty").Bold();
                            header.Cell().AlignRight().Text("Amount").Bold();
                        });

                        foreach (var item in order.Items)
                        {
                            table.Cell().Text(item.Name);
                            table.Cell().Text(item.Quantity.ToString());
                            table.Cell().AlignRight().Text($"{item.UnitPrice * item.Quantity:C}");
                        }
                    });

                    column.Item().LineHorizontal(0.5f);
                    column.Item().Text($"Subtotal: {order.Subtotal:C}");
                    column.Item().Text($"Shipping: {order.ShippingFee:C}");
                    column.Item().Text($"Taxes: {order.Taxes:C}");
                    column.Item().Text($"Total: {order.Total:C}").Bold();
                });

                page.Footer().AlignCenter().Text("Thank you for shopping with Indiaborn™.");
            });
        });
}

