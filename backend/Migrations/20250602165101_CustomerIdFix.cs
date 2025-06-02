using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class CustomerIdFix : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CustomerPhones_Customers_CustomersCustomerId",
                table: "CustomerPhones");

            migrationBuilder.DropForeignKey(
                name: "FK_CustomFields_Customers_CustomersCustomerId",
                table: "CustomFields");

            migrationBuilder.DropForeignKey(
                name: "FK_Notes_Customers_CustomersCustomerId",
                table: "Notes");

            migrationBuilder.DropForeignKey(
                name: "FK_Properties_Customers_CustomersCustomerId",
                table: "Properties");

            migrationBuilder.RenameColumn(
                name: "CustomersCustomerId",
                table: "Properties",
                newName: "CustomersId");

            migrationBuilder.RenameIndex(
                name: "IX_Properties_CustomersCustomerId",
                table: "Properties",
                newName: "IX_Properties_CustomersId");

            migrationBuilder.RenameColumn(
                name: "CustomersCustomerId",
                table: "Notes",
                newName: "CustomersId");

            migrationBuilder.RenameIndex(
                name: "IX_Notes_CustomersCustomerId",
                table: "Notes",
                newName: "IX_Notes_CustomersId");

            migrationBuilder.RenameColumn(
                name: "CustomersCustomerId",
                table: "CustomFields",
                newName: "CustomersId");

            migrationBuilder.RenameIndex(
                name: "IX_CustomFields_CustomersCustomerId",
                table: "CustomFields",
                newName: "IX_CustomFields_CustomersId");

            migrationBuilder.RenameColumn(
                name: "CustomerId",
                table: "Customers",
                newName: "Id");

            migrationBuilder.RenameColumn(
                name: "CustomersCustomerId",
                table: "CustomerPhones",
                newName: "CustomersId");

            migrationBuilder.RenameIndex(
                name: "IX_CustomerPhones_CustomersCustomerId",
                table: "CustomerPhones",
                newName: "IX_CustomerPhones_CustomersId");

            migrationBuilder.AddForeignKey(
                name: "FK_CustomerPhones_Customers_CustomersId",
                table: "CustomerPhones",
                column: "CustomersId",
                principalTable: "Customers",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_CustomFields_Customers_CustomersId",
                table: "CustomFields",
                column: "CustomersId",
                principalTable: "Customers",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Notes_Customers_CustomersId",
                table: "Notes",
                column: "CustomersId",
                principalTable: "Customers",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Properties_Customers_CustomersId",
                table: "Properties",
                column: "CustomersId",
                principalTable: "Customers",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CustomerPhones_Customers_CustomersId",
                table: "CustomerPhones");

            migrationBuilder.DropForeignKey(
                name: "FK_CustomFields_Customers_CustomersId",
                table: "CustomFields");

            migrationBuilder.DropForeignKey(
                name: "FK_Notes_Customers_CustomersId",
                table: "Notes");

            migrationBuilder.DropForeignKey(
                name: "FK_Properties_Customers_CustomersId",
                table: "Properties");

            migrationBuilder.RenameColumn(
                name: "CustomersId",
                table: "Properties",
                newName: "CustomersCustomerId");

            migrationBuilder.RenameIndex(
                name: "IX_Properties_CustomersId",
                table: "Properties",
                newName: "IX_Properties_CustomersCustomerId");

            migrationBuilder.RenameColumn(
                name: "CustomersId",
                table: "Notes",
                newName: "CustomersCustomerId");

            migrationBuilder.RenameIndex(
                name: "IX_Notes_CustomersId",
                table: "Notes",
                newName: "IX_Notes_CustomersCustomerId");

            migrationBuilder.RenameColumn(
                name: "CustomersId",
                table: "CustomFields",
                newName: "CustomersCustomerId");

            migrationBuilder.RenameIndex(
                name: "IX_CustomFields_CustomersId",
                table: "CustomFields",
                newName: "IX_CustomFields_CustomersCustomerId");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "Customers",
                newName: "CustomerId");

            migrationBuilder.RenameColumn(
                name: "CustomersId",
                table: "CustomerPhones",
                newName: "CustomersCustomerId");

            migrationBuilder.RenameIndex(
                name: "IX_CustomerPhones_CustomersId",
                table: "CustomerPhones",
                newName: "IX_CustomerPhones_CustomersCustomerId");

            migrationBuilder.AddForeignKey(
                name: "FK_CustomerPhones_Customers_CustomersCustomerId",
                table: "CustomerPhones",
                column: "CustomersCustomerId",
                principalTable: "Customers",
                principalColumn: "CustomerId");

            migrationBuilder.AddForeignKey(
                name: "FK_CustomFields_Customers_CustomersCustomerId",
                table: "CustomFields",
                column: "CustomersCustomerId",
                principalTable: "Customers",
                principalColumn: "CustomerId");

            migrationBuilder.AddForeignKey(
                name: "FK_Notes_Customers_CustomersCustomerId",
                table: "Notes",
                column: "CustomersCustomerId",
                principalTable: "Customers",
                principalColumn: "CustomerId");

            migrationBuilder.AddForeignKey(
                name: "FK_Properties_Customers_CustomersCustomerId",
                table: "Properties",
                column: "CustomersCustomerId",
                principalTable: "Customers",
                principalColumn: "CustomerId");
        }
    }
}
