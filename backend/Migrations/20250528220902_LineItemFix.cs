using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class LineItemFix : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_LineItems_ServiceItems_ServiceItemId",
                table: "LineItems");

            migrationBuilder.AlterColumn<Guid>(
                name: "ServiceItemId",
                table: "LineItems",
                type: "char(36)",
                nullable: true,
                collation: "ascii_general_ci",
                oldClrType: typeof(Guid),
                oldType: "char(36)")
                .OldAnnotation("Relational:Collation", "ascii_general_ci");

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "LineItems",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "Name",
                table: "LineItems",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<decimal>(
                name: "UnitPrice",
                table: "LineItems",
                type: "decimal(65,30)",
                nullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_LineItems_ServiceItems_ServiceItemId",
                table: "LineItems",
                column: "ServiceItemId",
                principalTable: "ServiceItems",
                principalColumn: "ServiceItemId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_LineItems_ServiceItems_ServiceItemId",
                table: "LineItems");

            migrationBuilder.DropColumn(
                name: "Description",
                table: "LineItems");

            migrationBuilder.DropColumn(
                name: "Name",
                table: "LineItems");

            migrationBuilder.DropColumn(
                name: "UnitPrice",
                table: "LineItems");

            migrationBuilder.AlterColumn<Guid>(
                name: "ServiceItemId",
                table: "LineItems",
                type: "char(36)",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                collation: "ascii_general_ci",
                oldClrType: typeof(Guid),
                oldType: "char(36)",
                oldNullable: true)
                .OldAnnotation("Relational:Collation", "ascii_general_ci");

            migrationBuilder.AddForeignKey(
                name: "FK_LineItems_ServiceItems_ServiceItemId",
                table: "LineItems",
                column: "ServiceItemId",
                principalTable: "ServiceItems",
                principalColumn: "ServiceItemId",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
