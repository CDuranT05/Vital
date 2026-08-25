using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Vital.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddBranchIdToContract : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "BranchId",
                table: "Contracts",
                type: "TEXT",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_Contracts_BranchId",
                table: "Contracts",
                column: "BranchId");

            migrationBuilder.AddForeignKey(
                name: "FK_Contracts_Branches_BranchId",
                table: "Contracts",
                column: "BranchId",
                principalTable: "Branches",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Contracts_Branches_BranchId",
                table: "Contracts");

            migrationBuilder.DropIndex(
                name: "IX_Contracts_BranchId",
                table: "Contracts");

            migrationBuilder.DropColumn(
                name: "BranchId",
                table: "Contracts");
        }
    }
}
