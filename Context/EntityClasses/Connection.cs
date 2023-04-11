using System;

namespace ChatApp.Context.EntityClasses
{
    public class Connection
    {
        public int Id { get; set; }
        public int ProfileId { get; set; }
        public string SignalId { get; set; }
        public DateTime TimeStamp { get; set; }

    }
}
