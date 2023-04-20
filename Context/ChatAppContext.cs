using ChatApp.Context.EntityClasses;
using ChatApp.Context.EntityClasses.Group;
using Microsoft.EntityFrameworkCore;

namespace ChatApp.Context
{
    public class ChatAppContext : DbContext
    {
        public ChatAppContext(DbContextOptions<ChatAppContext> options)
           : base(options)
        {
        }
        /// <summary>
        /// Gets or sets Answers.
        /// </summary>
        public virtual DbSet<Profile> Profiles { get; set; }
        public virtual DbSet<Chat> Chats { get; set; }
        public virtual DbSet<Salt> Salts { get; set; }
        public virtual DbSet<Connection> Connections { get; set; }
        public virtual DbSet<Group> Groups { get; set; }
        public virtual DbSet<GroupChat> GroupChats { get; set; }
        public virtual DbSet<GroupMember> GroupMembers { get; set; }
        public virtual DbSet<Notification> Notifications { get; set; }
    }
}
