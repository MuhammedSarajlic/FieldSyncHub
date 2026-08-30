using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class PersistDocumentTotals : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "Discount",
                table: "Quotes",
                type: "decimal(19,4)",
                precision: 19,
                scale: 4,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "Subtotal",
                table: "Quotes",
                type: "decimal(19,4)",
                precision: 19,
                scale: 4,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "TaxAmount",
                table: "Quotes",
                type: "decimal(19,4)",
                precision: 19,
                scale: 4,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "Total",
                table: "Quotes",
                type: "decimal(19,4)",
                precision: 19,
                scale: 4,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "Discount",
                table: "Jobs",
                type: "decimal(19,4)",
                precision: 19,
                scale: 4,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "Subtotal",
                table: "Jobs",
                type: "decimal(19,4)",
                precision: 19,
                scale: 4,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "TaxAmount",
                table: "Jobs",
                type: "decimal(19,4)",
                precision: 19,
                scale: 4,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "TotalAmount",
                table: "Jobs",
                type: "decimal(19,4)",
                precision: 19,
                scale: 4,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "DiscountAmount",
                table: "Invoices",
                type: "decimal(19,4)",
                precision: 19,
                scale: 4,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "Subtotal",
                table: "Invoices",
                type: "decimal(19,4)",
                precision: 19,
                scale: 4,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "TaxAmount",
                table: "Invoices",
                type: "decimal(19,4)",
                precision: 19,
                scale: 4,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "Total",
                table: "Invoices",
                type: "decimal(19,4)",
                precision: 19,
                scale: 4,
                nullable: false,
                defaultValue: 0m);

            BackfillTotals(migrationBuilder, "Quotes", "QuoteId", "DiscountValue", "Discount", "Total");
            BackfillTotals(migrationBuilder, "Jobs", "JobId", "DiscountValue", "Discount", "TotalAmount");
            BackfillTotals(migrationBuilder, "Invoices", "InvoiceId", "Discount", "DiscountAmount", "Total");
        }

        private static void BackfillTotals(
            MigrationBuilder migrationBuilder,
            string documentTable,
            string lineItemForeignKey,
            string discountInputColumn,
            string discountAmountColumn,
            string totalColumn)
        {
            var lineItems = $"""
                SELECT {lineItemForeignKey} AS DocumentId,
                       ROUND(COALESCE(SUM(UnitPrice * Quantity), 0), 2) AS Subtotal,
                       ROUND(COALESCE(SUM(CASE WHEN IsTaxable = 1 THEN UnitPrice * Quantity ELSE 0 END), 0), 2) AS TaxableSubtotal
                FROM LineItems
                WHERE {lineItemForeignKey} IS NOT NULL
                GROUP BY {lineItemForeignKey}
                """;

            migrationBuilder.Sql($"""
                UPDATE {documentTable} d
                LEFT JOIN ({lineItems}) li ON li.DocumentId = d.Id
                SET d.Subtotal = COALESCE(li.Subtotal, 0)
                """);

            migrationBuilder.Sql($"""
                UPDATE {documentTable} d
                SET d.{discountAmountColumn} = ROUND(
                    CASE WHEN d.DiscountType = 0
                         THEN d.Subtotal * (d.{discountInputColumn} / 100)
                         ELSE d.{discountInputColumn}
                    END, 2)
                """);

            migrationBuilder.Sql($"""
                UPDATE {documentTable} d
                LEFT JOIN ({lineItems}) li ON li.DocumentId = d.Id
                SET d.TaxAmount = ROUND(
                    (COALESCE(li.TaxableSubtotal, 0) -
                        CASE WHEN d.Subtotal = 0 THEN 0
                             ELSE d.{discountAmountColumn} * COALESCE(li.TaxableSubtotal, 0) / d.Subtotal
                        END) * d.TaxRate, 2)
                """);

            migrationBuilder.Sql($"""
                UPDATE {documentTable} d
                SET d.{totalColumn} = ROUND(d.Subtotal - d.{discountAmountColumn} + d.TaxAmount, 2)
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Discount",
                table: "Quotes");

            migrationBuilder.DropColumn(
                name: "Subtotal",
                table: "Quotes");

            migrationBuilder.DropColumn(
                name: "TaxAmount",
                table: "Quotes");

            migrationBuilder.DropColumn(
                name: "Total",
                table: "Quotes");

            migrationBuilder.DropColumn(
                name: "Discount",
                table: "Jobs");

            migrationBuilder.DropColumn(
                name: "Subtotal",
                table: "Jobs");

            migrationBuilder.DropColumn(
                name: "TaxAmount",
                table: "Jobs");

            migrationBuilder.DropColumn(
                name: "TotalAmount",
                table: "Jobs");

            migrationBuilder.DropColumn(
                name: "DiscountAmount",
                table: "Invoices");

            migrationBuilder.DropColumn(
                name: "Subtotal",
                table: "Invoices");

            migrationBuilder.DropColumn(
                name: "TaxAmount",
                table: "Invoices");

            migrationBuilder.DropColumn(
                name: "Total",
                table: "Invoices");
        }
    }
}
