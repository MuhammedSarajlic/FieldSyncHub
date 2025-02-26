using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class CustomerTableUpdate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CustomFields_CustomFiledValues_CustomFiledValueCustomFieldVa~",
                table: "CustomFields");

            migrationBuilder.DropIndex(
                name: "IX_CustomFields_CustomFiledValueCustomFieldValueId",
                table: "CustomFields");

            migrationBuilder.DropColumn(
                name: "CustomFiledValueCustomFieldValueId",
                table: "CustomFields");

            migrationBuilder.DropColumn(
                name: "Title",
                table: "Customers");

            migrationBuilder.AddColumn<Guid>(
                name: "CustomFieldsCustomFieldId",
                table: "CustomFiledValues",
                type: "char(36)",
                nullable: true,
                collation: "ascii_general_ci");

            migrationBuilder.CreateIndex(
                name: "IX_CustomFiledValues_CustomFieldsCustomFieldId",
                table: "CustomFiledValues",
                column: "CustomFieldsCustomFieldId");

            migrationBuilder.AddForeignKey(
                name: "FK_CustomFiledValues_CustomFields_CustomFieldsCustomFieldId",
                table: "CustomFiledValues",
                column: "CustomFieldsCustomFieldId",
                principalTable: "CustomFields",
                principalColumn: "CustomFieldId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CustomFiledValues_CustomFields_CustomFieldsCustomFieldId",
                table: "CustomFiledValues");

            migrationBuilder.DropIndex(
                name: "IX_CustomFiledValues_CustomFieldsCustomFieldId",
                table: "CustomFiledValues");

            migrationBuilder.DropColumn(
                name: "CustomFieldsCustomFieldId",
                table: "CustomFiledValues");

            migrationBuilder.AddColumn<Guid>(
                name: "CustomFiledValueCustomFieldValueId",
                table: "CustomFields",
                type: "char(36)",
                nullable: true,
                collation: "ascii_general_ci");

            migrationBuilder.AddColumn<string>(
                name: "Title",
                table: "Customers",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_CustomFields_CustomFiledValueCustomFieldValueId",
                table: "CustomFields",
                column: "CustomFiledValueCustomFieldValueId");

            migrationBuilder.AddForeignKey(
                name: "FK_CustomFields_CustomFiledValues_CustomFiledValueCustomFieldVa~",
                table: "CustomFields",
                column: "CustomFiledValueCustomFieldValueId",
                principalTable: "CustomFiledValues",
                principalColumn: "CustomFieldValueId");
        }
    }
}
