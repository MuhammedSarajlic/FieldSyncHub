using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class JobModelFix3 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RecurrencePattern",
                table: "Jobs");

            migrationBuilder.RenameColumn(
                name: "RecurrenceInterval",
                table: "Jobs",
                newName: "Duration");

            migrationBuilder.RenameColumn(
                name: "RecurrenceEndDate",
                table: "Jobs",
                newName: "ArrivalWindowStart");

            migrationBuilder.RenameColumn(
                name: "EndDate",
                table: "Jobs",
                newName: "ArrivalWindowEnd");

            migrationBuilder.AddColumn<string>(
                name: "Repeats",
                table: "Jobs",
                type: "longtext",
                nullable: false)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<DateTime>(
                name: "StartTime",
                table: "Jobs",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Repeats",
                table: "Jobs");

            migrationBuilder.DropColumn(
                name: "StartTime",
                table: "Jobs");

            migrationBuilder.RenameColumn(
                name: "Duration",
                table: "Jobs",
                newName: "RecurrenceInterval");

            migrationBuilder.RenameColumn(
                name: "ArrivalWindowStart",
                table: "Jobs",
                newName: "RecurrenceEndDate");

            migrationBuilder.RenameColumn(
                name: "ArrivalWindowEnd",
                table: "Jobs",
                newName: "EndDate");

            migrationBuilder.AddColumn<string>(
                name: "RecurrencePattern",
                table: "Jobs",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");
        }
    }
}
