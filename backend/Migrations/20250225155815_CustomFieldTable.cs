using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class CustomFieldTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CustomFields_CustomFiledValue_CustomFiledValueCustomFieldVal~",
                table: "CustomFields");

            migrationBuilder.DropPrimaryKey(
                name: "PK_CustomFiledValue",
                table: "CustomFiledValue");

            migrationBuilder.RenameTable(
                name: "CustomFiledValue",
                newName: "CustomFiledValues");

            migrationBuilder.AddPrimaryKey(
                name: "PK_CustomFiledValues",
                table: "CustomFiledValues",
                column: "CustomFieldValueId");

            migrationBuilder.AddForeignKey(
                name: "FK_CustomFields_CustomFiledValues_CustomFiledValueCustomFieldVa~",
                table: "CustomFields",
                column: "CustomFiledValueCustomFieldValueId",
                principalTable: "CustomFiledValues",
                principalColumn: "CustomFieldValueId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CustomFields_CustomFiledValues_CustomFiledValueCustomFieldVa~",
                table: "CustomFields");

            migrationBuilder.DropPrimaryKey(
                name: "PK_CustomFiledValues",
                table: "CustomFiledValues");

            migrationBuilder.RenameTable(
                name: "CustomFiledValues",
                newName: "CustomFiledValue");

            migrationBuilder.AddPrimaryKey(
                name: "PK_CustomFiledValue",
                table: "CustomFiledValue",
                column: "CustomFieldValueId");

            migrationBuilder.AddForeignKey(
                name: "FK_CustomFields_CustomFiledValue_CustomFiledValueCustomFieldVal~",
                table: "CustomFields",
                column: "CustomFiledValueCustomFieldValueId",
                principalTable: "CustomFiledValue",
                principalColumn: "CustomFieldValueId");
        }
    }
}
