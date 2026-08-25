using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Vital.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddSocialRequestTypeFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "BeneficiaryIdentityCard",
                table: "VulnerabilityCases",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ChildrenCount",
                table: "VulnerabilityCases",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "ChildrenIdentifiers",
                table: "VulnerabilityCases",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsRepresentative",
                table: "VulnerabilityCases",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "RequestType",
                table: "VulnerabilityCases",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BeneficiaryIdentityCard",
                table: "VulnerabilityCases");

            migrationBuilder.DropColumn(
                name: "ChildrenCount",
                table: "VulnerabilityCases");

            migrationBuilder.DropColumn(
                name: "ChildrenIdentifiers",
                table: "VulnerabilityCases");

            migrationBuilder.DropColumn(
                name: "IsRepresentative",
                table: "VulnerabilityCases");

            migrationBuilder.DropColumn(
                name: "RequestType",
                table: "VulnerabilityCases");
        }
    }
}
