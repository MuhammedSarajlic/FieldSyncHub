using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class CompleteDeferredTickets : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "WorkspaceId",
                table: "RefreshTokens",
                type: "char(36)",
                nullable: true,
                collation: "ascii_general_ci");

            migrationBuilder.AddColumn<string>(
                name: "AccessTokenEncrypted",
                table: "AccountingConnections",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "ExternalTenantId",
                table: "AccountingConnections",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "LastSyncSummary",
                table: "AccountingConnections",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "RefreshTokenEncrypted",
                table: "AccountingConnections",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<DateTime>(
                name: "TokenExpiresAt",
                table: "AccountingConnections",
                type: "datetime(6)",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "AccountingExternalRecords",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    WorkspaceId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    Provider = table.Column<string>(type: "varchar(191)", maxLength: 191, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    EntityType = table.Column<string>(type: "varchar(191)", maxLength: 191, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ExternalId = table.Column<string>(type: "varchar(191)", maxLength: 191, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Payload = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    LastSyncedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AccountingExternalRecords", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "WorkspaceMemberships",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    UserId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    WorkspaceId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    Role = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    JoinedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WorkspaceMemberships", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WorkspaceMemberships_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_WorkspaceMemberships_Workspaces_WorkspaceId",
                        column: x => x.WorkspaceId,
                        principalTable: "Workspaces",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_AccountingExternalRecords_WorkspaceId_Provider_EntityType_Ex~",
                table: "AccountingExternalRecords",
                columns: new[] { "WorkspaceId", "Provider", "EntityType", "ExternalId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_WorkspaceMemberships_UserId_WorkspaceId",
                table: "WorkspaceMemberships",
                columns: new[] { "UserId", "WorkspaceId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_WorkspaceMemberships_WorkspaceId",
                table: "WorkspaceMemberships",
                column: "WorkspaceId");

            // Preserve the existing single-workspace assignments while moving to
            // the membership model. The legacy columns remain for compatibility
            // with older clients, but new authorization uses this table.
            migrationBuilder.Sql("""
                INSERT INTO WorkspaceMemberships (Id, UserId, WorkspaceId, Role, IsActive, JoinedAt, UpdatedAt)
                SELECT UUID(), Id, WorkspaceId, COALESCE(Role, 2), 1, UTC_TIMESTAMP(), UTC_TIMESTAMP()
                FROM Users
                WHERE WorkspaceId IS NOT NULL
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AccountingExternalRecords");

            migrationBuilder.DropTable(
                name: "WorkspaceMemberships");

            migrationBuilder.DropColumn(
                name: "WorkspaceId",
                table: "RefreshTokens");

            migrationBuilder.DropColumn(
                name: "AccessTokenEncrypted",
                table: "AccountingConnections");

            migrationBuilder.DropColumn(
                name: "ExternalTenantId",
                table: "AccountingConnections");

            migrationBuilder.DropColumn(
                name: "LastSyncSummary",
                table: "AccountingConnections");

            migrationBuilder.DropColumn(
                name: "RefreshTokenEncrypted",
                table: "AccountingConnections");

            migrationBuilder.DropColumn(
                name: "TokenExpiresAt",
                table: "AccountingConnections");
        }
    }
}
