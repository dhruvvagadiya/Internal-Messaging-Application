CREATE TABLE [dbo].[Notifications]
(
	[Id] INT NOT NULL PRIMARY KEY IDENTITY (1,1), 
    [UserId] INT NOT NULL, 
    [Content] NVARCHAR(100) NOT NULL, 
    [Type] NVARCHAR(20) NOT NULL, 
    [CreatedAt] DATETIME2 NULL DEFAULT GETDATE(), 
    [IsSeen] INT NOT NULL DEFAULT 0, 
    CONSTRAINT [FK_Notifications_UserId_To_Profiles] FOREIGN KEY (UserId) REFERENCES dbo.Profiles(Id),
)
