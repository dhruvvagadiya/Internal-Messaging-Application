using System.ComponentModel.DataAnnotations;

namespace ChatApp.Models.Group
{
    public class AddUser
    {
        [Required]
        public string UserName { get; set; }

        [Required]
        public int GroupId { get; set; }
    }
}
