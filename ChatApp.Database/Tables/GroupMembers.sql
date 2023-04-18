CREATE TABLE [dbo].[GroupMembers]
(
	[Id] INT NOT NULL PRIMARY KEY IDENTITY (1,1), 
    [GroupId] INT NOT NULL, 
    [UserId] INT NOT NULL, 
    [AddedAt] DATETIME2 NOT NULL DEFAULT GETDATE(), 

    CONSTRAINT [FK_GroupMembers_GroupId_To_Groups] FOREIGN KEY (GroupId) REFERENCES dbo.Groups(Id),
    CONSTRAINT [FK_GroupMembers_UserId_To_Profiles] FOREIGN KEY (UserId) REFERENCES dbo.Profiles(Id),
)
