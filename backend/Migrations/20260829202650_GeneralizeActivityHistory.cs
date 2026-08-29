using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class GeneralizeActivityHistory : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "EntityId",
                table: "ActivityHistorys",
                type: "char(36)",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                collation: "ascii_general_ci");

            migrationBuilder.AddColumn<string>(
                name: "EntityType",
                table: "ActivityHistorys",
                type: "varchar(255)",
                nullable: false,
                defaultValue: "")
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<Guid>(
                name: "WorkspaceId",
                table: "ActivityHistorys",
                type: "char(36)",
                nullable: true,
                collation: "ascii_general_ci");

            migrationBuilder.CreateIndex(
                name: "IX_ActivityHistorys_EntityType_EntityId",
                table: "ActivityHistorys",
                columns: new[] { "EntityType", "EntityId" });

            migrationBuilder.CreateIndex(
                name: "IX_ActivityHistorys_WorkspaceId_ChangedAt",
                table: "ActivityHistorys",
                columns: new[] { "WorkspaceId", "ChangedAt" });

            // Existing rows predate EntityType/EntityId/WorkspaceId entirely - the
            // only ones that can be backfilled are the quote timeline entries
            // (which still have their QuoteId shadow FK), and they must be, since
            // DataContext now applies a workspace query filter to this table: a
            // left-behind NULL WorkspaceId would make a quote's pre-existing
            // activity silently vanish from its own timeline after this deploys.
            migrationBuilder.Sql(
                """
                UPDATE ActivityHistorys ah
                INNER JOIN Quotes q ON q.Id = ah.QuoteId
                SET ah.EntityType = 'Quote',
                    ah.EntityId = ah.QuoteId,
                    ah.WorkspaceId = q.WorkspaceId
                WHERE ah.QuoteId IS NOT NULL;
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ActivityHistorys_EntityType_EntityId",
                table: "ActivityHistorys");

            migrationBuilder.DropIndex(
                name: "IX_ActivityHistorys_WorkspaceId_ChangedAt",
                table: "ActivityHistorys");

            migrationBuilder.DropColumn(
                name: "EntityId",
                table: "ActivityHistorys");

            migrationBuilder.DropColumn(
                name: "EntityType",
                table: "ActivityHistorys");

            migrationBuilder.DropColumn(
                name: "WorkspaceId",
                table: "ActivityHistorys");
        }
    }
}
