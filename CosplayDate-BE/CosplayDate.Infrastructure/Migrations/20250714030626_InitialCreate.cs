using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CosplayDate.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Events",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    EventDate = table.Column<DateOnly>(type: "date", nullable: false),
                    EventTime = table.Column<TimeOnly>(type: "time", nullable: true),
                    Location = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    EventType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    ImageUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    MaxParticipants = table.Column<int>(type: "int", nullable: true),
                    CurrentParticipants = table.Column<int>(type: "int", nullable: true, defaultValue: 0),
                    EntryFee = table.Column<decimal>(type: "decimal(18,2)", nullable: true, defaultValue: 0m),
                    IsActive = table.Column<bool>(type: "bit", nullable: true, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "(getdate())"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Events__3214EC072B3F73D6", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "News",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Content = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Summary = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    ImageUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Author = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Category = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    ViewCount = table.Column<int>(type: "int", nullable: true, defaultValue: 0),
                    IsActive = table.Column<bool>(type: "bit", nullable: true, defaultValue: true),
                    PublishedAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "(getdate())"),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "(getdate())"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__News__3214EC07946F66D4", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SystemSettings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SettingKey = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    SettingValue = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Category = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__SystemSe__3214EC070067C527", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FirstName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    LastName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    DateOfBirth = table.Column<DateOnly>(type: "date", nullable: false),
                    Location = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Bio = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    AvatarUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    UserType = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false, defaultValue: "Customer"),
                    IsVerified = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    IsOnline = table.Column<bool>(type: "bit", nullable: true, defaultValue: false),
                    LastLoginAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    MembershipTier = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true, defaultValue: "Bronze"),
                    LoyaltyPoints = table.Column<int>(type: "int", nullable: true, defaultValue: 0),
                    WalletBalance = table.Column<decimal>(type: "decimal(18,2)", nullable: true, defaultValue: 0m),
                    ProfileCompleteness = table.Column<decimal>(type: "decimal(5,2)", nullable: true, defaultValue: 0m),
                    IsActive = table.Column<bool>(type: "bit", nullable: true, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "(getdate())"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Users__3214EC0797384CF7", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Cosplayers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    DisplayName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    PricePerHour = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Category = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Gender = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true),
                    CharacterSpecialty = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Tags = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Rating = table.Column<decimal>(type: "decimal(3,2)", nullable: true, defaultValue: 0.0m),
                    TotalReviews = table.Column<int>(type: "int", nullable: true, defaultValue: 0),
                    FollowersCount = table.Column<int>(type: "int", nullable: true, defaultValue: 0),
                    ResponseTime = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true, defaultValue: "< 1 hour"),
                    SuccessRate = table.Column<decimal>(type: "decimal(5,2)", nullable: true, defaultValue: 0.0m),
                    IsAvailable = table.Column<bool>(type: "bit", nullable: true, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "(getdate())"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Cosplaye__3214EC07ADCE4DE7", x => x.Id);
                    table.ForeignKey(
                        name: "FK__Cosplayer__UserI__5AEE82B9",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "EmailVerificationTokens",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    Token = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsUsed = table.Column<bool>(type: "bit", nullable: true, defaultValue: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__EmailVer__3214EC0734806215", x => x.Id);
                    table.ForeignKey(
                        name: "FK__EmailVeri__UserI__4F7CD00D",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "EventParticipants",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EventId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    ParticipationType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true, defaultValue: "attendee"),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true, defaultValue: "registered"),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__EventPar__3214EC0781E7CCD3", x => x.Id);
                    table.ForeignKey(
                        name: "FK__EventPart__Event__59C55456",
                        column: x => x.EventId,
                        principalTable: "Events",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK__EventPart__UserI__5AB9788F",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Notifications",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    Type = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Content = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    IsRead = table.Column<bool>(type: "bit", nullable: true, defaultValue: false),
                    ReferenceId = table.Column<int>(type: "int", nullable: true),
                    ReferenceType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    ActionUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    ReadAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Notifica__3214EC074D223B82", x => x.Id);
                    table.ForeignKey(
                        name: "FK__Notificat__UserI__4C6B5938",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "PasswordResetTokens",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    Token = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsUsed = table.Column<bool>(type: "bit", nullable: true, defaultValue: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Password__3214EC07B55EE026", x => x.Id);
                    table.ForeignKey(
                        name: "FK__PasswordR__UserI__4AB81AF0",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "UserFollows",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FollowerId = table.Column<int>(type: "int", nullable: false),
                    FollowedId = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__UserFoll__3214EC07697D9CEF", x => x.Id);
                    table.ForeignKey(
                        name: "FK__UserFollo__Follo__7D439ABD",
                        column: x => x.FollowerId,
                        principalTable: "Users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK__UserFollo__Follo__7E37BEF6",
                        column: x => x.FollowedId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "UserInterests",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    Interest = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__UserInte__3214EC077213D4D2", x => x.Id);
                    table.ForeignKey(
                        name: "FK__UserInter__UserI__47A6A41B",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "UserSessions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    Token = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "(getdate())"),
                    IsActive = table.Column<bool>(type: "bit", nullable: true, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__UserSess__3214EC07E22530D5", x => x.Id);
                    table.ForeignKey(
                        name: "FK__UserSessi__UserI__45F365D3",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "WalletTransactions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    TransactionCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Type = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    ReferenceId = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false, defaultValue: "Completed"),
                    BalanceAfter = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__WalletTr__3214EC076EFFC5CF", x => x.Id);
                    table.ForeignKey(
                        name: "FK__WalletTra__UserI__3E1D39E1",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Bookings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    BookingCode = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    CustomerId = table.Column<int>(type: "int", nullable: false),
                    CosplayerId = table.Column<int>(type: "int", nullable: false),
                    ServiceType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    BookingDate = table.Column<DateOnly>(type: "date", nullable: false),
                    StartTime = table.Column<TimeOnly>(type: "time", nullable: false),
                    EndTime = table.Column<TimeOnly>(type: "time", nullable: false),
                    Duration = table.Column<int>(type: "int", nullable: false),
                    Location = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    TotalPrice = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false, defaultValue: "Pending"),
                    PaymentStatus = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false, defaultValue: "Pending"),
                    SpecialNotes = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    CancellationReason = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "(getdate())"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Bookings__3214EC07CD603422", x => x.Id);
                    table.ForeignKey(
                        name: "FK__Bookings__Cospla__1F98B2C1",
                        column: x => x.CosplayerId,
                        principalTable: "Cosplayers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK__Bookings__Custom__1EA48E88",
                        column: x => x.CustomerId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "CosplayerPhotos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CosplayerId = table.Column<int>(type: "int", nullable: false),
                    PhotoUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Description = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    Category = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    IsPortfolio = table.Column<bool>(type: "bit", nullable: true, defaultValue: false),
                    DisplayOrder = table.Column<int>(type: "int", nullable: true, defaultValue: 0),
                    LikesCount = table.Column<int>(type: "int", nullable: true, defaultValue: 0),
                    ViewsCount = table.Column<int>(type: "int", nullable: true, defaultValue: 0),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Cosplaye__3214EC07ABCF1D15", x => x.Id);
                    table.ForeignKey(
                        name: "FK__Cosplayer__Cospl__693CA210",
                        column: x => x.CosplayerId,
                        principalTable: "Cosplayers",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "CosplayerServices",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CosplayerId = table.Column<int>(type: "int", nullable: false),
                    ServiceName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ServiceDescription = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Cosplaye__3214EC0721A51E0C", x => x.Id);
                    table.ForeignKey(
                        name: "FK__Cosplayer__Cospl__619B8048",
                        column: x => x.CosplayerId,
                        principalTable: "Cosplayers",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "CosplayerSpecialties",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CosplayerId = table.Column<int>(type: "int", nullable: false),
                    Specialty = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Cosplaye__3214EC075D47F902", x => x.Id);
                    table.ForeignKey(
                        name: "FK__Cosplayer__Cospl__5EBF139D",
                        column: x => x.CosplayerId,
                        principalTable: "Cosplayers",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "CosplayerVideos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CosplayerId = table.Column<int>(type: "int", nullable: false),
                    VideoUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    ThumbnailUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Description = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    Category = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Duration = table.Column<int>(type: "int", nullable: true),
                    ViewCount = table.Column<int>(type: "int", nullable: true, defaultValue: 0),
                    LikesCount = table.Column<int>(type: "int", nullable: true, defaultValue: 0),
                    DisplayOrder = table.Column<int>(type: "int", nullable: true, defaultValue: 0),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Cosplaye__3214EC07E4899EBE", x => x.Id);
                    table.ForeignKey(
                        name: "FK__Cosplayer__Cospl__787EE5A0",
                        column: x => x.CosplayerId,
                        principalTable: "Cosplayers",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Favorites",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CustomerId = table.Column<int>(type: "int", nullable: false),
                    CosplayerId = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Favorite__3214EC0782589EAE", x => x.Id);
                    table.ForeignKey(
                        name: "FK__Favorites__Cospl__43D61337",
                        column: x => x.CosplayerId,
                        principalTable: "Cosplayers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK__Favorites__Custo__42E1EEFE",
                        column: x => x.CustomerId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Payments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    BookingId = table.Column<int>(type: "int", nullable: false),
                    PaymentCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    PaymentMethod = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false, defaultValue: "Pending"),
                    TransactionId = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    ProcessingFee = table.Column<decimal>(type: "decimal(18,2)", nullable: true, defaultValue: 0m),
                    NetAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    ProcessedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Payments__3214EC07BD379C51", x => x.Id);
                    table.ForeignKey(
                        name: "FK__Payments__Bookin__3864608B",
                        column: x => x.BookingId,
                        principalTable: "Bookings",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Reviews",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    BookingId = table.Column<int>(type: "int", nullable: false),
                    CustomerId = table.Column<int>(type: "int", nullable: false),
                    CosplayerId = table.Column<int>(type: "int", nullable: false),
                    Rating = table.Column<int>(type: "int", nullable: false),
                    Comment = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    IsVerified = table.Column<bool>(type: "bit", nullable: true, defaultValue: true),
                    HelpfulCount = table.Column<int>(type: "int", nullable: true, defaultValue: 0),
                    OwnerResponse = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    OwnerResponseDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Reviews__3214EC076A65565C", x => x.Id);
                    table.ForeignKey(
                        name: "FK__Reviews__Booking__2739D489",
                        column: x => x.BookingId,
                        principalTable: "Bookings",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK__Reviews__Cosplay__29221CFB",
                        column: x => x.CosplayerId,
                        principalTable: "Cosplayers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK__Reviews__Custome__282DF8C2",
                        column: x => x.CustomerId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "PhotoLikes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PhotoId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__PhotoLik__3214EC079683F376", x => x.Id);
                    table.ForeignKey(
                        name: "FK__PhotoLike__Photo__70DDC3D8",
                        column: x => x.PhotoId,
                        principalTable: "CosplayerPhotos",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK__PhotoLike__UserI__71D1E811",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "PhotoTags",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PhotoId = table.Column<int>(type: "int", nullable: false),
                    Tag = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__PhotoTag__3214EC07BF6915E4", x => x.Id);
                    table.ForeignKey(
                        name: "FK__PhotoTags__Photo__6C190EBB",
                        column: x => x.PhotoId,
                        principalTable: "CosplayerPhotos",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "EscrowTransactions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    BookingId = table.Column<int>(type: "int", nullable: false),
                    PaymentId = table.Column<int>(type: "int", nullable: false),
                    CustomerId = table.Column<int>(type: "int", nullable: false),
                    CosplayerId = table.Column<int>(type: "int", nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    TransactionCode = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "(getdate())"),
                    ReleasedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    RefundedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__EscrowTr__3214EC079213871B", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EscrowTransactions_Bookings_BookingId",
                        column: x => x.BookingId,
                        principalTable: "Bookings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_EscrowTransactions_Cosplayers_CosplayerId",
                        column: x => x.CosplayerId,
                        principalTable: "Cosplayers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_EscrowTransactions_Payments_PaymentId",
                        column: x => x.PaymentId,
                        principalTable: "Payments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_EscrowTransactions_Users_CustomerId",
                        column: x => x.CustomerId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ReviewHelpfulVotes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ReviewId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    IsHelpful = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__ReviewHe__3214EC076BDAAFB6", x => x.Id);
                    table.ForeignKey(
                        name: "FK__ReviewHel__Revie__30C33EC3",
                        column: x => x.ReviewId,
                        principalTable: "Reviews",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK__ReviewHel__UserI__31B762FC",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "ReviewTags",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ReviewId = table.Column<int>(type: "int", nullable: false),
                    Tag = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__ReviewTa__3214EC072AD54D7F", x => x.Id);
                    table.ForeignKey(
                        name: "FK__ReviewTag__Revie__2BFE89A6",
                        column: x => x.ReviewId,
                        principalTable: "Reviews",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Conversations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CustomerId = table.Column<int>(type: "int", nullable: false),
                    CosplayerId = table.Column<int>(type: "int", nullable: false),
                    LastMessageId = table.Column<int>(type: "int", nullable: true),
                    LastMessageAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CustomerUnreadCount = table.Column<int>(type: "int", nullable: true, defaultValue: 0),
                    CosplayerUnreadCount = table.Column<int>(type: "int", nullable: true, defaultValue: 0),
                    IsActive = table.Column<bool>(type: "bit", nullable: true, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "(getdate())"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Conversa__3214EC07E2AB6803", x => x.Id);
                    table.ForeignKey(
                        name: "FK__Conversat__Cospl__08B54D69",
                        column: x => x.CosplayerId,
                        principalTable: "Users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK__Conversat__Custo__07C12930",
                        column: x => x.CustomerId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Messages",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ConversationId = table.Column<int>(type: "int", nullable: false),
                    SenderId = table.Column<int>(type: "int", nullable: false),
                    MessageText = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    MessageType = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true, defaultValue: "text"),
                    AttachmentUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    IsRead = table.Column<bool>(type: "bit", nullable: true, defaultValue: false),
                    ReadAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsEdited = table.Column<bool>(type: "bit", nullable: true, defaultValue: false),
                    EditedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ReplyToMessageId = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Messages__3214EC076252B8DF", x => x.Id);
                    table.ForeignKey(
                        name: "FK__Messages__Conver__0F624AF8",
                        column: x => x.ConversationId,
                        principalTable: "Conversations",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK__Messages__ReplyT__114A936A",
                        column: x => x.ReplyToMessageId,
                        principalTable: "Messages",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK__Messages__Sender__10566F31",
                        column: x => x.SenderId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "MessageReadReceipts",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MessageId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    ReadAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__MessageR__3214EC074E95A8E2", x => x.Id);
                    table.ForeignKey(
                        name: "FK__MessageRe__Messa__160F4887",
                        column: x => x.MessageId,
                        principalTable: "Messages",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK__MessageRe__UserI__17036CC0",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_BookingDate",
                table: "Bookings",
                column: "BookingDate");

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_CosplayerId",
                table: "Bookings",
                column: "CosplayerId");

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_CustomerId",
                table: "Bookings",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_Status",
                table: "Bookings",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "UQ__Bookings__C6E56BD511E8ACFC",
                table: "Bookings",
                column: "BookingCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Conversations_CosplayerId",
                table: "Conversations",
                column: "CosplayerId");

            migrationBuilder.CreateIndex(
                name: "IX_Conversations_CustomerId",
                table: "Conversations",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_Conversations_LastMessageAt",
                table: "Conversations",
                column: "LastMessageAt",
                descending: new bool[0]);

            migrationBuilder.CreateIndex(
                name: "IX_Conversations_LastMessageId",
                table: "Conversations",
                column: "LastMessageId");

            migrationBuilder.CreateIndex(
                name: "UQ__Conversa__0C14540A7F1AC4CD",
                table: "Conversations",
                columns: new[] { "CustomerId", "CosplayerId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CosplayerPhotos_CosplayerId",
                table: "CosplayerPhotos",
                column: "CosplayerId");

            migrationBuilder.CreateIndex(
                name: "IX_Cosplayers_Category",
                table: "Cosplayers",
                column: "Category");

            migrationBuilder.CreateIndex(
                name: "IX_Cosplayers_CharacterSpecialty",
                table: "Cosplayers",
                column: "CharacterSpecialty");

            migrationBuilder.CreateIndex(
                name: "IX_Cosplayers_IsAvailable",
                table: "Cosplayers",
                column: "IsAvailable");

            migrationBuilder.CreateIndex(
                name: "IX_Cosplayers_Rating",
                table: "Cosplayers",
                column: "Rating",
                descending: new bool[0]);

            migrationBuilder.CreateIndex(
                name: "UQ__Cosplaye__1788CC4DC8B670FC",
                table: "Cosplayers",
                column: "UserId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CosplayerServices_CosplayerId",
                table: "CosplayerServices",
                column: "CosplayerId");

            migrationBuilder.CreateIndex(
                name: "UQ__Cosplaye__79169320E3619B50",
                table: "CosplayerSpecialties",
                columns: new[] { "CosplayerId", "Specialty" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CosplayerVideos_CosplayerId",
                table: "CosplayerVideos",
                column: "CosplayerId");

            migrationBuilder.CreateIndex(
                name: "IX_EmailVerificationTokens_UserId",
                table: "EmailVerificationTokens",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_EscrowTransactions_BookingId",
                table: "EscrowTransactions",
                column: "BookingId");

            migrationBuilder.CreateIndex(
                name: "IX_EscrowTransactions_CosplayerId",
                table: "EscrowTransactions",
                column: "CosplayerId");

            migrationBuilder.CreateIndex(
                name: "IX_EscrowTransactions_CustomerId",
                table: "EscrowTransactions",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_EscrowTransactions_PaymentId",
                table: "EscrowTransactions",
                column: "PaymentId");

            migrationBuilder.CreateIndex(
                name: "IX_EventParticipants_UserId",
                table: "EventParticipants",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "UQ__EventPar__A83C44D55825C1F9",
                table: "EventParticipants",
                columns: new[] { "EventId", "UserId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Events_EventDate",
                table: "Events",
                column: "EventDate");

            migrationBuilder.CreateIndex(
                name: "IX_Events_EventType",
                table: "Events",
                column: "EventType");

            migrationBuilder.CreateIndex(
                name: "IX_Events_IsActive",
                table: "Events",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_Favorites_CosplayerId",
                table: "Favorites",
                column: "CosplayerId");

            migrationBuilder.CreateIndex(
                name: "IX_Favorites_CustomerId",
                table: "Favorites",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "UQ__Favorite__0C14540AAEBD8AFD",
                table: "Favorites",
                columns: new[] { "CustomerId", "CosplayerId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_MessageReadReceipts_UserId",
                table: "MessageReadReceipts",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "UQ__MessageR__190480590BB02837",
                table: "MessageReadReceipts",
                columns: new[] { "MessageId", "UserId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Messages_ConversationId",
                table: "Messages",
                column: "ConversationId");

            migrationBuilder.CreateIndex(
                name: "IX_Messages_CreatedAt",
                table: "Messages",
                column: "CreatedAt",
                descending: new bool[0]);

            migrationBuilder.CreateIndex(
                name: "IX_Messages_IsRead",
                table: "Messages",
                column: "IsRead");

            migrationBuilder.CreateIndex(
                name: "IX_Messages_ReplyToMessageId",
                table: "Messages",
                column: "ReplyToMessageId");

            migrationBuilder.CreateIndex(
                name: "IX_Messages_SenderId",
                table: "Messages",
                column: "SenderId");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_CreatedAt",
                table: "Notifications",
                column: "CreatedAt",
                descending: new bool[0]);

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_IsRead",
                table: "Notifications",
                column: "IsRead");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_UserId",
                table: "Notifications",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_PasswordResetTokens_UserId",
                table: "PasswordResetTokens",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_BookingId",
                table: "Payments",
                column: "BookingId");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_Status",
                table: "Payments",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "UQ__Payments__106D3BA8672B5F6A",
                table: "Payments",
                column: "PaymentCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PhotoLikes_PhotoId",
                table: "PhotoLikes",
                column: "PhotoId");

            migrationBuilder.CreateIndex(
                name: "IX_PhotoLikes_UserId",
                table: "PhotoLikes",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "UQ__PhotoLik__F0CF392760E4DD51",
                table: "PhotoLikes",
                columns: new[] { "PhotoId", "UserId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PhotoTags_PhotoId",
                table: "PhotoTags",
                column: "PhotoId");

            migrationBuilder.CreateIndex(
                name: "IX_ReviewHelpfulVotes_UserId",
                table: "ReviewHelpfulVotes",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "UQ__ReviewHe__A5C4F50B83500551",
                table: "ReviewHelpfulVotes",
                columns: new[] { "ReviewId", "UserId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_CosplayerId",
                table: "Reviews",
                column: "CosplayerId");

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_CreatedAt",
                table: "Reviews",
                column: "CreatedAt",
                descending: new bool[0]);

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_CustomerId",
                table: "Reviews",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_Rating",
                table: "Reviews",
                column: "Rating");

            migrationBuilder.CreateIndex(
                name: "UQ__Reviews__73951AECBBF74741",
                table: "Reviews",
                column: "BookingId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ReviewTags_ReviewId",
                table: "ReviewTags",
                column: "ReviewId");

            migrationBuilder.CreateIndex(
                name: "UQ__SystemSe__01E719AD5519F677",
                table: "SystemSettings",
                column: "SettingKey",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserFollows_FollowedId",
                table: "UserFollows",
                column: "FollowedId");

            migrationBuilder.CreateIndex(
                name: "IX_UserFollows_FollowerId",
                table: "UserFollows",
                column: "FollowerId");

            migrationBuilder.CreateIndex(
                name: "UQ__UserFoll__F7A5FC9EC9A8DB8D",
                table: "UserFollows",
                columns: new[] { "FollowerId", "FollowedId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "UQ__UserInte__7B88AA10BE90D834",
                table: "UserInterests",
                columns: new[] { "UserId", "Interest" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email");

            migrationBuilder.CreateIndex(
                name: "IX_Users_IsOnline",
                table: "Users",
                column: "IsOnline");

            migrationBuilder.CreateIndex(
                name: "IX_Users_UserType",
                table: "Users",
                column: "UserType");

            migrationBuilder.CreateIndex(
                name: "UQ__Users__A9D1053448C6A63F",
                table: "Users",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserSessions_Token",
                table: "UserSessions",
                column: "Token");

            migrationBuilder.CreateIndex(
                name: "IX_UserSessions_UserId",
                table: "UserSessions",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_WalletTransactions_CreatedAt",
                table: "WalletTransactions",
                column: "CreatedAt",
                descending: new bool[0]);

            migrationBuilder.CreateIndex(
                name: "IX_WalletTransactions_UserId",
                table: "WalletTransactions",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "UQ__WalletTr__D85E70267043D040",
                table: "WalletTransactions",
                column: "TransactionCode",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Conversations_LastMessage",
                table: "Conversations",
                column: "LastMessageId",
                principalTable: "Messages",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK__Conversat__Cospl__08B54D69",
                table: "Conversations");

            migrationBuilder.DropForeignKey(
                name: "FK__Conversat__Custo__07C12930",
                table: "Conversations");

            migrationBuilder.DropForeignKey(
                name: "FK__Messages__Sender__10566F31",
                table: "Messages");

            migrationBuilder.DropForeignKey(
                name: "FK_Conversations_LastMessage",
                table: "Conversations");

            migrationBuilder.DropTable(
                name: "CosplayerServices");

            migrationBuilder.DropTable(
                name: "CosplayerSpecialties");

            migrationBuilder.DropTable(
                name: "CosplayerVideos");

            migrationBuilder.DropTable(
                name: "EmailVerificationTokens");

            migrationBuilder.DropTable(
                name: "EscrowTransactions");

            migrationBuilder.DropTable(
                name: "EventParticipants");

            migrationBuilder.DropTable(
                name: "Favorites");

            migrationBuilder.DropTable(
                name: "MessageReadReceipts");

            migrationBuilder.DropTable(
                name: "News");

            migrationBuilder.DropTable(
                name: "Notifications");

            migrationBuilder.DropTable(
                name: "PasswordResetTokens");

            migrationBuilder.DropTable(
                name: "PhotoLikes");

            migrationBuilder.DropTable(
                name: "PhotoTags");

            migrationBuilder.DropTable(
                name: "ReviewHelpfulVotes");

            migrationBuilder.DropTable(
                name: "ReviewTags");

            migrationBuilder.DropTable(
                name: "SystemSettings");

            migrationBuilder.DropTable(
                name: "UserFollows");

            migrationBuilder.DropTable(
                name: "UserInterests");

            migrationBuilder.DropTable(
                name: "UserSessions");

            migrationBuilder.DropTable(
                name: "WalletTransactions");

            migrationBuilder.DropTable(
                name: "Payments");

            migrationBuilder.DropTable(
                name: "Events");

            migrationBuilder.DropTable(
                name: "CosplayerPhotos");

            migrationBuilder.DropTable(
                name: "Reviews");

            migrationBuilder.DropTable(
                name: "Bookings");

            migrationBuilder.DropTable(
                name: "Cosplayers");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "Messages");

            migrationBuilder.DropTable(
                name: "Conversations");
        }
    }
}
