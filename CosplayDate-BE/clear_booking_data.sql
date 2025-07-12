USE [CosplayDateDB]
GO

-- Xóa dữ liệu booking để test lại
DELETE FROM [dbo].[Bookings]

-- Reset identity column về 0
DBCC CHECKIDENT ('[dbo].[Bookings]', RESEED, 0)

-- Kiểm tra kết quả
SELECT COUNT(*) as RemainingBookings FROM [dbo].[Bookings]

PRINT 'Dữ liệu booking đã được xóa sạch!'
PRINT 'Bạn có thể test lại flow booking từ đầu.' 