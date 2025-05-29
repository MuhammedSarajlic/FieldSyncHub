using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class LineItemCascadeDelete : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_LineItems_Invoices_InvoiceId",
                table: "LineItems");

            migrationBuilder.AddForeignKey(
                name: "FK_LineItems_Invoices_InvoiceId",
                table: "LineItems",
                column: "InvoiceId",
                principalTable: "Invoices",
                principalColumn: "InvoiceId",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_LineItems_Invoices_InvoiceId",
                table: "LineItems");

            migrationBuilder.AddForeignKey(
                name: "FK_LineItems_Invoices_InvoiceId",
                table: "LineItems",
                column: "InvoiceId",
                principalTable: "Invoices",
                principalColumn: "InvoiceId");
        }
    }
}
