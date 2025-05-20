using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class EmployeeInviteFix : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsUsed",
                table: "EmployeeInvites");

            migrationBuilder.CreateIndex(
                name: "IX_EmployeeInvites_WorkspaceId",
                table: "EmployeeInvites",
                column: "WorkspaceId");

            migrationBuilder.AddForeignKey(
                name: "FK_EmployeeInvites_Workspaces_WorkspaceId",
                table: "EmployeeInvites",
                column: "WorkspaceId",
                principalTable: "Workspaces",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_EmployeeInvites_Workspaces_WorkspaceId",
                table: "EmployeeInvites");

            migrationBuilder.DropIndex(
                name: "IX_EmployeeInvites_WorkspaceId",
                table: "EmployeeInvites");

            migrationBuilder.AddColumn<bool>(
                name: "IsUsed",
                table: "EmployeeInvites",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);
        }
    }
}
