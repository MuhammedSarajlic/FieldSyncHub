using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class NoteUpdate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Notes_Customers_CustomerId",
                table: "Notes");

            migrationBuilder.DropForeignKey(
                name: "FK_Notes_Quotes_QuoteId",
                table: "Notes");

            migrationBuilder.DropForeignKey(
                name: "FK_Notes_Quotes_QuoteId1",
                table: "Notes");

            migrationBuilder.DropIndex(
                name: "IX_Notes_CustomerId",
                table: "Notes");

            migrationBuilder.DropIndex(
                name: "IX_Notes_QuoteId",
                table: "Notes");

            migrationBuilder.DropIndex(
                name: "IX_Notes_QuoteId1",
                table: "Notes");

            migrationBuilder.DropColumn(
                name: "CustomerId",
                table: "Notes");

            migrationBuilder.DropColumn(
                name: "QuoteId",
                table: "Notes");

            migrationBuilder.DropColumn(
                name: "QuoteId1",
                table: "Notes");

            migrationBuilder.AddColumn<Guid>(
                name: "AssignedToUserId",
                table: "Quotes",
                type: "char(36)",
                nullable: true,
                collation: "ascii_general_ci");

            migrationBuilder.AddColumn<Guid>(
                name: "JobId",
                table: "Quotes",
                type: "char(36)",
                nullable: true,
                collation: "ascii_general_ci");

            migrationBuilder.CreateTable(
                name: "CustomerNotes",
                columns: table => new
                {
                    CustomerId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    NotesId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CustomerNotes", x => new { x.CustomerId, x.NotesId });
                    table.ForeignKey(
                        name: "FK_CustomerNotes_Customers_CustomerId",
                        column: x => x.CustomerId,
                        principalTable: "Customers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CustomerNotes_Notes_NotesId",
                        column: x => x.NotesId,
                        principalTable: "Notes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "QuoteCustomerNotes",
                columns: table => new
                {
                    CustomerNotesId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    QuoteId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QuoteCustomerNotes", x => new { x.CustomerNotesId, x.QuoteId });
                    table.ForeignKey(
                        name: "FK_QuoteCustomerNotes_Notes_CustomerNotesId",
                        column: x => x.CustomerNotesId,
                        principalTable: "Notes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_QuoteCustomerNotes_Quotes_QuoteId",
                        column: x => x.QuoteId,
                        principalTable: "Quotes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "QuoteInternalNotes",
                columns: table => new
                {
                    InternalNotesId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    Quote1Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QuoteInternalNotes", x => new { x.InternalNotesId, x.Quote1Id });
                    table.ForeignKey(
                        name: "FK_QuoteInternalNotes_Notes_InternalNotesId",
                        column: x => x.InternalNotesId,
                        principalTable: "Notes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_QuoteInternalNotes_Quotes_Quote1Id",
                        column: x => x.Quote1Id,
                        principalTable: "Quotes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_Quotes_AssignedToUserId",
                table: "Quotes",
                column: "AssignedToUserId");

            migrationBuilder.CreateIndex(
                name: "IX_CustomerNotes_NotesId",
                table: "CustomerNotes",
                column: "NotesId");

            migrationBuilder.CreateIndex(
                name: "IX_QuoteCustomerNotes_QuoteId",
                table: "QuoteCustomerNotes",
                column: "QuoteId");

            migrationBuilder.CreateIndex(
                name: "IX_QuoteInternalNotes_Quote1Id",
                table: "QuoteInternalNotes",
                column: "Quote1Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Quotes_Users_AssignedToUserId",
                table: "Quotes",
                column: "AssignedToUserId",
                principalTable: "Users",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Quotes_Users_AssignedToUserId",
                table: "Quotes");

            migrationBuilder.DropTable(
                name: "CustomerNotes");

            migrationBuilder.DropTable(
                name: "QuoteCustomerNotes");

            migrationBuilder.DropTable(
                name: "QuoteInternalNotes");

            migrationBuilder.DropIndex(
                name: "IX_Quotes_AssignedToUserId",
                table: "Quotes");

            migrationBuilder.DropColumn(
                name: "AssignedToUserId",
                table: "Quotes");

            migrationBuilder.DropColumn(
                name: "JobId",
                table: "Quotes");

            migrationBuilder.AddColumn<Guid>(
                name: "CustomerId",
                table: "Notes",
                type: "char(36)",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                collation: "ascii_general_ci");

            migrationBuilder.AddColumn<Guid>(
                name: "QuoteId",
                table: "Notes",
                type: "char(36)",
                nullable: true,
                collation: "ascii_general_ci");

            migrationBuilder.AddColumn<Guid>(
                name: "QuoteId1",
                table: "Notes",
                type: "char(36)",
                nullable: true,
                collation: "ascii_general_ci");

            migrationBuilder.CreateIndex(
                name: "IX_Notes_CustomerId",
                table: "Notes",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_Notes_QuoteId",
                table: "Notes",
                column: "QuoteId");

            migrationBuilder.CreateIndex(
                name: "IX_Notes_QuoteId1",
                table: "Notes",
                column: "QuoteId1");

            migrationBuilder.AddForeignKey(
                name: "FK_Notes_Customers_CustomerId",
                table: "Notes",
                column: "CustomerId",
                principalTable: "Customers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Notes_Quotes_QuoteId",
                table: "Notes",
                column: "QuoteId",
                principalTable: "Quotes",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Notes_Quotes_QuoteId1",
                table: "Notes",
                column: "QuoteId1",
                principalTable: "Quotes",
                principalColumn: "Id");
        }
    }
}
