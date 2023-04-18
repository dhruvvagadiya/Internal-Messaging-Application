CREATE TABLE [dbo].[Chats]
(
	[Id] INT NOT NULL PRIMARY KEY IDENTITY (1,1), 
    [MessageFrom] INT NOT NULL, 
    [MessageTo] INT NOT NULL, 
    [Type] NVARCHAR(50) NOT NULL, 
    [Content] NVARCHAR(MAX) NULL, 
    [FilePath] NVARCHAR(100) NULL, 
    [CreatedAt] DATETIME2 NOT NULL DEFAULT GETDATE(), 
    [UpdatedAt] DATETIME2 NULL DEFAULT GETDATE(), 
    [RepliedTo] INT, 
    [SeenByReceiver] INT NULL DEFAULT 0, 
    CONSTRAINT [FK_Chats_MessageFrom_To_Profiles] FOREIGN KEY (MessageFrom) REFERENCES dbo.Profiles(Id),
    CONSTRAINT [FK_Chats_MessgeTo_To_Profiles] FOREIGN KEY (MessageTo) REFERENCES dbo.Profiles(Id),
)
