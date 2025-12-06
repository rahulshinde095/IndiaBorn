using Indiaborn.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace Indiaborn.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class InvoiceController : ControllerBase
{
    private readonly OrderService _orderService;
    private readonly InvoiceService _invoiceService;

    public InvoiceController(OrderService orderService, InvoiceService invoiceService)
    {
        _orderService = orderService;
        _invoiceService = invoiceService;
    }

    [HttpGet("{referenceCode}")]
    public async Task<IActionResult> DownloadInvoice(string referenceCode, CancellationToken token)
    {
        try
        {
            // Get order by reference code
            var order = await _orderService.GetByReferenceCodeAsync(referenceCode, token);
            
            if (order == null)
            {
                return NotFound(new { message = "Order not found" });
            }

            // Generate invoice PDF bytes
            var pdfBytes = await _invoiceService.GenerateInvoiceBytesAsync(order, token);

            // Return as downloadable PDF
            return File(pdfBytes, "application/pdf", $"Invoice-{referenceCode}.pdf");
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = $"Error generating invoice: {ex.Message}" });
        }
    }
}
