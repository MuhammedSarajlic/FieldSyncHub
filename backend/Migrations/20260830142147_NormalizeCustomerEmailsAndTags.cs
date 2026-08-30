using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class NormalizeCustomerEmailsAndTags : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CustomerEmails",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    CustomerId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    Email = table.Column<string>(type: "varchar(320)", maxLength: 320, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CustomerEmails", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CustomerEmails_Customers_CustomerId",
                        column: x => x.CustomerId,
                        principalTable: "Customers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "CustomerTags",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    CustomerId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    Tag = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CustomerTags", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CustomerTags_Customers_CustomerId",
                        column: x => x.CustomerId,
                        principalTable: "Customers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "JobTags",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    JobId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    Tag = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_JobTags", x => x.Id);
                    table.ForeignKey(
                        name: "FK_JobTags_Jobs_JobId",
                        column: x => x.JobId,
                        principalTable: "Jobs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            // Preserve the serialized primitive collections before removing the legacy columns.
            migrationBuilder.Sql("""
                INSERT IGNORE INTO CustomerEmails (Id, CustomerId, Email, CreatedAt, UpdatedAt)
                SELECT UUID(), c.Id, TRIM(email_values.Email), UTC_TIMESTAMP(6), UTC_TIMESTAMP(6)
                FROM Customers c
                JOIN JSON_TABLE(
                    CASE WHEN JSON_VALID(c.Emails) THEN c.Emails ELSE JSON_ARRAY() END,
                    '$[*]' COLUMNS (Email VARCHAR(320) PATH '$')
                ) AS email_values
                WHERE TRIM(email_values.Email) <> ''
                GROUP BY c.Id, TRIM(email_values.Email);
                """);

            migrationBuilder.Sql("""
                INSERT IGNORE INTO CustomerTags (Id, CustomerId, Tag, CreatedAt)
                SELECT UUID(), c.Id, TRIM(tag_values.Tag), UTC_TIMESTAMP(6)
                FROM Customers c
                JOIN JSON_TABLE(
                    CASE WHEN JSON_VALID(c.Tags) THEN c.Tags ELSE JSON_ARRAY() END,
                    '$[*]' COLUMNS (Tag VARCHAR(100) PATH '$')
                ) AS tag_values
                WHERE TRIM(tag_values.Tag) <> ''
                GROUP BY c.Id, TRIM(tag_values.Tag);
                """);

            migrationBuilder.Sql("""
                INSERT IGNORE INTO JobTags (Id, JobId, Tag, CreatedAt)
                SELECT UUID(), j.Id, TRIM(tag_values.Tag), UTC_TIMESTAMP(6)
                FROM Jobs j
                JOIN JSON_TABLE(
                    CASE WHEN JSON_VALID(j.Tags) THEN j.Tags ELSE JSON_ARRAY() END,
                    '$[*]' COLUMNS (Tag VARCHAR(100) PATH '$')
                ) AS tag_values
                WHERE TRIM(tag_values.Tag) <> ''
                GROUP BY j.Id, TRIM(tag_values.Tag);
                """);

            migrationBuilder.DropColumn(
                name: "Tags",
                table: "Jobs");

            migrationBuilder.DropColumn(
                name: "Emails",
                table: "Customers");

            migrationBuilder.DropColumn(
                name: "Tags",
                table: "Customers");

            migrationBuilder.CreateIndex(
                name: "IX_CustomerEmails_CustomerId_Email",
                table: "CustomerEmails",
                columns: new[] { "CustomerId", "Email" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CustomerEmails_Email",
                table: "CustomerEmails",
                column: "Email");

            migrationBuilder.CreateIndex(
                name: "IX_CustomerTags_CustomerId_Tag",
                table: "CustomerTags",
                columns: new[] { "CustomerId", "Tag" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_JobTags_JobId_Tag",
                table: "JobTags",
                columns: new[] { "JobId", "Tag" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CustomerEmails");

            migrationBuilder.DropTable(
                name: "CustomerTags");

            migrationBuilder.DropTable(
                name: "JobTags");

            migrationBuilder.AddColumn<string>(
                name: "Tags",
                table: "Jobs",
                type: "longtext",
                nullable: false)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "Emails",
                table: "Customers",
                type: "longtext",
                nullable: false)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "Tags",
                table: "Customers",
                type: "longtext",
                nullable: false)
                .Annotation("MySql:CharSet", "utf8mb4");
        }
    }
}
