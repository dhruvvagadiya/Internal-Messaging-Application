CREATE TABLE [dbo].[GroupChats]
(
	[Id] INT NOT NULL PRIMARY KEY IDENTITY (1,1), 
    [MessageFrom] INT NOT NULL, 
    [GroupId] INT NOT NULL, 
    [Type] NVARCHAR(50) NOT NULL, 
    [Content] NVARCHAR(MAX) NULL, 
    [FilePath] NVARCHAR(100) NULL, 
    [FileType] NVARCHAR(10) NULL,
    [CreatedAt] DATETIME2 NOT NULL DEFAULT GETDATE(), 
    [UpdatedAt] DATETIME2 NULL DEFAULT GETDATE(), 
    [RepliedTo] INT, 

    CONSTRAINT [FK_GroupChats_MessageFrom_To_Profiles] FOREIGN KEY (MessageFrom) REFERENCES dbo.Profiles(Id),
    CONSTRAINT [FK_GroupChats_GroupId_To_Groups] FOREIGN KEY (GroupId) REFERENCES dbo.Groups(Id),
)
