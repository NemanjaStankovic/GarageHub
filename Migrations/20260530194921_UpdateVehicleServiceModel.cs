using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GarageHub.Migrations
{
    /// <inheritdoc />
    public partial class UpdateVehicleServiceModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "PriceAtTime",
                table: "VehicleServices",
                newName: "FinalPrice");

            migrationBuilder.AlterColumn<int>(
                name: "ServiceId",
                table: "VehicleServices",
                type: "INTEGER",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "INTEGER");

            migrationBuilder.AddColumn<string>(
                name: "CustomerDescription",
                table: "VehicleServices",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MechanicNote",
                table: "VehicleServices",
                type: "TEXT",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CustomerDescription",
                table: "VehicleServices");

            migrationBuilder.DropColumn(
                name: "MechanicNote",
                table: "VehicleServices");

            migrationBuilder.RenameColumn(
                name: "FinalPrice",
                table: "VehicleServices",
                newName: "PriceAtTime");

            migrationBuilder.AlterColumn<int>(
                name: "ServiceId",
                table: "VehicleServices",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "INTEGER",
                oldNullable: true);
        }
    }
}
