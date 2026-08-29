using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddWorkspaceScopedDocumentNumberUniqueness : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Quotes_WorkspaceId",
                table: "Quotes");

            migrationBuilder.DropIndex(
                name: "IX_Jobs_WorkspaceId",
                table: "Jobs");

            migrationBuilder.DropIndex(
                name: "IX_Invoices_WorkspaceId",
                table: "Invoices");

            migrationBuilder.AlterColumn<string>(
                name: "QuoteNumber",
                table: "Quotes",
                type: "varchar(255)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "longtext")
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AlterColumn<string>(
                name: "JobNumber",
                table: "Jobs",
                type: "varchar(255)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "longtext")
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AlterColumn<string>(
                name: "InvoiceNumber",
                table: "Invoices",
                type: "varchar(255)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "longtext")
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_Quotes_WorkspaceId_QuoteNumber",
                table: "Quotes",
                columns: new[] { "WorkspaceId", "QuoteNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Jobs_WorkspaceId_JobNumber",
                table: "Jobs",
                columns: new[] { "WorkspaceId", "JobNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Invoices_WorkspaceId_InvoiceNumber",
                table: "Invoices",
                columns: new[] { "WorkspaceId", "InvoiceNumber" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Quotes_WorkspaceId_QuoteNumber",
                table: "Quotes");

            migrationBuilder.DropIndex(
                name: "IX_Jobs_WorkspaceId_JobNumber",
                table: "Jobs");

            migrationBuilder.DropIndex(
                name: "IX_Invoices_WorkspaceId_InvoiceNumber",
                table: "Invoices");

            migrationBuilder.AlterColumn<string>(
                name: "QuoteNumber",
                table: "Quotes",
                type: "longtext",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "varchar(255)")
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AlterColumn<string>(
                name: "JobNumber",
                table: "Jobs",
                type: "longtext",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "varchar(255)")
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AlterColumn<string>(
                name: "InvoiceNumber",
                table: "Invoices",
                type: "longtext",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "varchar(255)")
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_Quotes_WorkspaceId",
                table: "Quotes",
                column: "WorkspaceId");

            migrationBuilder.CreateIndex(
                name: "IX_Jobs_WorkspaceId",
                table: "Jobs",
                column: "WorkspaceId");

            migrationBuilder.CreateIndex(
                name: "IX_Invoices_WorkspaceId",
                table: "Invoices",
                column: "WorkspaceId");
        }
    }
}
