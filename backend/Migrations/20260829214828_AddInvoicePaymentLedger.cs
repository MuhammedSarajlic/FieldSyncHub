using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddInvoicePaymentLedger : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Payments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    InvoiceId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    Amount = table.Column<decimal>(type: "decimal(19,4)", precision: 19, scale: 4, nullable: false),
                    Method = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    ProcessorReference = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    PaidAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    RecordedByUserId = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci"),
                    Note = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Payments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Payments_Invoices_InvoiceId",
                        column: x => x.InvoiceId,
                        principalTable: "Invoices",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_InvoiceId_Status_PaidAt",
                table: "Payments",
                columns: new[] { "InvoiceId", "Status", "PaidAt" });

            migrationBuilder.Sql(
                """
                INSERT INTO Payments (Id, InvoiceId, Amount, Method, Status, ProcessorReference, PaidAt, RecordedByUserId, Note, CreatedAt, UpdatedAt)
                WITH line_totals AS (
                    SELECT
                        i.Id AS InvoiceId,
                        COALESCE(ROUND(SUM(li.UnitPrice * li.Quantity), 2), 0) AS Subtotal,
                        COALESCE(ROUND(SUM(CASE WHEN li.IsTaxable = TRUE THEN li.UnitPrice * li.Quantity ELSE 0 END), 2), 0) AS TaxableSubtotalBeforeDiscount,
                        i.DiscountType,
                        i.Discount,
                        i.TaxRate,
                        COALESCE(i.UpdatedAt, i.CreatedAt, UTC_TIMESTAMP(6)) AS PaidAt
                    FROM Invoices i
                    LEFT JOIN LineItems li ON li.InvoiceId = i.Id
                    WHERE i.IsPaid = TRUE OR i.Status = 2
                    GROUP BY i.Id, i.DiscountType, i.Discount, i.TaxRate, i.UpdatedAt, i.CreatedAt
                ),
                discounts AS (
                    SELECT
                        InvoiceId,
                        Subtotal,
                        TaxableSubtotalBeforeDiscount,
                        TaxRate,
                        PaidAt,
                        ROUND(
                            CASE
                                WHEN DiscountType = 0 THEN Subtotal * (Discount / 100)
                                ELSE Discount
                            END,
                            2
                        ) AS DiscountAmount
                    FROM line_totals
                ),
                totals AS (
                    SELECT
                        InvoiceId,
                        PaidAt,
                        ROUND(
                            (Subtotal - DiscountAmount) +
                            ROUND(
                                (
                                    TaxableSubtotalBeforeDiscount -
                                    ROUND(
                                        CASE
                                            WHEN Subtotal <> 0 AND TaxableSubtotalBeforeDiscount <> 0 AND DiscountAmount <> 0
                                                THEN DiscountAmount * (TaxableSubtotalBeforeDiscount / Subtotal)
                                            ELSE 0
                                        END,
                                        2
                                    )
                                ) * TaxRate,
                                2
                            ),
                            2
                        ) AS TotalAmount
                    FROM discounts
                )
                SELECT
                    UUID(),
                    InvoiceId,
                    TotalAmount,
                    5,
                    1,
                    'legacy-backfill',
                    PaidAt,
                    NULL,
                    'Backfilled from legacy paid invoice flag',
                    UTC_TIMESTAMP(6),
                    UTC_TIMESTAMP(6)
                FROM totals;
                """);

            migrationBuilder.DropColumn(
                name: "IsPaid",
                table: "Invoices");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Payments");

            migrationBuilder.AddColumn<bool>(
                name: "IsPaid",
                table: "Invoices",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.Sql(
                """
                UPDATE Invoices i
                LEFT JOIN (
                    SELECT
                        i2.Id AS InvoiceId,
                        COALESCE(ROUND(SUM(li.UnitPrice * li.Quantity), 2), 0) AS Subtotal,
                        COALESCE(ROUND(SUM(CASE WHEN li.IsTaxable = TRUE THEN li.UnitPrice * li.Quantity ELSE 0 END), 2), 0) AS TaxableSubtotalBeforeDiscount,
                        i2.DiscountType,
                        i2.Discount,
                        i2.TaxRate
                    FROM Invoices i2
                    LEFT JOIN LineItems li ON li.InvoiceId = i2.Id
                    GROUP BY i2.Id, i2.DiscountType, i2.Discount, i2.TaxRate
                ) invoice_totals ON invoice_totals.InvoiceId = i.Id
                LEFT JOIN (
                    SELECT
                        InvoiceId,
                        ROUND(SUM(CASE WHEN Status = 1 THEN Amount ELSE 0 END), 2) AS AmountPaid
                    FROM Payments
                    GROUP BY InvoiceId
                ) payment_totals ON payment_totals.InvoiceId = i.Id
                SET i.IsPaid =
                    COALESCE(payment_totals.AmountPaid, 0) >=
                    ROUND(
                        (invoice_totals.Subtotal -
                            ROUND(
                                CASE
                                    WHEN invoice_totals.DiscountType = 0 THEN invoice_totals.Subtotal * (invoice_totals.Discount / 100)
                                    ELSE invoice_totals.Discount
                                END,
                                2
                            )
                        ) +
                        ROUND(
                            (
                                invoice_totals.TaxableSubtotalBeforeDiscount -
                                ROUND(
                                    CASE
                                        WHEN invoice_totals.Subtotal <> 0
                                            AND invoice_totals.TaxableSubtotalBeforeDiscount <> 0
                                            AND ROUND(
                                                CASE
                                                    WHEN invoice_totals.DiscountType = 0 THEN invoice_totals.Subtotal * (invoice_totals.Discount / 100)
                                                    ELSE invoice_totals.Discount
                                                END,
                                                2
                                            ) <> 0
                                            THEN ROUND(
                                                CASE
                                                    WHEN invoice_totals.DiscountType = 0 THEN invoice_totals.Subtotal * (invoice_totals.Discount / 100)
                                                    ELSE invoice_totals.Discount
                                                END,
                                                2
                                            ) * (invoice_totals.TaxableSubtotalBeforeDiscount / invoice_totals.Subtotal)
                                        ELSE 0
                                    END,
                                    2
                                )
                            ) * invoice_totals.TaxRate,
                            2
                        ),
                        2
                    );
                """);
        }
    }
}
