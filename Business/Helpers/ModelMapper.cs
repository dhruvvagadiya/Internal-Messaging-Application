using ChatApp.Context.EntityClasses;
using ChatApp.Models.Notification;
using ChatApp.Models.Users;

namespace ChatApp.Business.Helpers
{
    public class ModelMapper
    {

        // to hide password or other securirty fields in response
        public static ProfileDTO ConvertProfileToDTO(Profile user)
        
        {
            ProfileDTO profileDTO = new ProfileDTO();

            profileDTO.UserName = user.UserName;
            profileDTO.FirstName = user.FirstName;
            profileDTO.LastName = user.LastName;
            profileDTO.Email = user.Email;
            profileDTO.ImageUrl = user.ImageUrl;
            profileDTO.CreatedAt = user.CreatedAt;
            profileDTO.CreatedBy = user.CreatedBy;
            profileDTO.LastUpdatedBy = user.LastUpdatedBy;
            profileDTO.LastUpdatedAt = user.LastUpdatedAt;
            profileDTO.ProfileType = user.ProfileType;
            profileDTO.LastSeen = user.LastSeen;
            profileDTO.Designation = user.Designation;
            if(user.UserStatus != null)
            {
                profileDTO.ProfileStatus = user.UserStatus.Content;
            }

            return profileDTO;
        }

        public static NotificationDTO NotificationToDTO(Notification obj)
        {
            NotificationDTO returnObj = new()
            {
                Id = obj.Id,
                Content = obj.Content,
                Type = obj.Type,
                IsSeen = obj.IsSeen,
                CreatedAt = obj.CreatedAt
            };

            return returnObj;
        }

        //public static IEnumerable<ChatModel> ConvertChatToChatModel(IEnumerable<Chat> curList, string from, string to, int fromId, int toId)
        //{
        //    var returnObj = new List<ChatModel>();

        //    foreach (var chat in curList)
        //    {
        //        var newObj = new ChatModel()
        //        {
        //            Id = chat.Id,
        //            MessageFrom = (chat.MessageFrom == fromId) ? from : to,
        //            MessageTo = (chat.MessageTo == fromId) ? from : to,
        //            Type = "Text",
        //            Content = chat.Content,
        //            CreatedAt = chat.CreatedAt,
        //            UpdatedAt = chat.UpdatedAt
        //        };

        //        returnObj.Add(newObj);
        //    }

        //    return returnObj;
        //}
    }
}
