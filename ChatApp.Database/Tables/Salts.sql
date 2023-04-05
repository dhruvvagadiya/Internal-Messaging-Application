CREATE TABLE [dbo].[Salts]
(
	[Id] INT NOT NULL PRIMARY KEY IDENTITY (1,1), 
    [UserId] INT NOT NULL, 
    [UsedSalt] VARCHAR(MAX) NOT NULL,
    CONSTRAINT [FK_Chats_UserId_To_Profiles] FOREIGN KEY (UserId) REFERENCES dbo.Profiles(Id),
)
