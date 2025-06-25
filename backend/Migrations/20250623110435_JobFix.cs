using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class JobFix : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "TaxAmount",
                table: "Jobs",
                newName: "TaxRate");

            migrationBuilder.RenameColumn(
                name: "DiscountAmount",
                table: "Jobs",
                newName: "DiscountValue");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "TaxRate",
                table: "Jobs",
                newName: "TaxAmount");

            migrationBuilder.RenameColumn(
                name: "DiscountValue",
                table: "Jobs",
                newName: "DiscountAmount");
        }
    }
}
