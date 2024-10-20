CREATE TABLE [dbo].[Connections]
(
	[Id] INT PRIMARY KEY NOT NULL IDENTITY (1,1), 
    [ProfileId] INT NOT NULL, 
    [SignalId] NVARCHAR(22),
    [TimeStamp] DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT [FK_Chats_ProfileId_To_Profiles] FOREIGN KEY (ProfileId) REFERENCES dbo.Profiles(Id),
)
