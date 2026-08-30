using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddWorkspaceBillingDefaults : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AddressLine1",
                table: "Workspaces",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "AddressLine2",
                table: "Workspaces",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "City",
                table: "Workspaces",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "Country",
                table: "Workspaces",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "Currency",
                table: "Workspaces",
                type: "longtext",
                nullable: false)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "DefaultPaymentTerms",
                table: "Workspaces",
                type: "longtext",
                nullable: false)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<decimal>(
                name: "DefaultTaxRate",
                table: "Workspaces",
                type: "decimal(9,6)",
                precision: 9,
                scale: 6,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "PostalCode",
                table: "Workspaces",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "State",
                table: "Workspaces",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "TaxRegistrationNumber",
                table: "Workspaces",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AddressLine1",
                table: "Workspaces");

            migrationBuilder.DropColumn(
                name: "AddressLine2",
                table: "Workspaces");

            migrationBuilder.DropColumn(
                name: "City",
                table: "Workspaces");

            migrationBuilder.DropColumn(
                name: "Country",
                table: "Workspaces");

            migrationBuilder.DropColumn(
                name: "Currency",
                table: "Workspaces");

            migrationBuilder.DropColumn(
                name: "DefaultPaymentTerms",
                table: "Workspaces");

            migrationBuilder.DropColumn(
                name: "DefaultTaxRate",
                table: "Workspaces");

            migrationBuilder.DropColumn(
                name: "PostalCode",
                table: "Workspaces");

            migrationBuilder.DropColumn(
                name: "State",
                table: "Workspaces");

            migrationBuilder.DropColumn(
                name: "TaxRegistrationNumber",
                table: "Workspaces");
        }
    }
}
