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

            if (user.Password == null) profileDTO.IsGoogleUser = true;

            if (user.UserDesignation != null)
            {
                profileDTO.Designation = user.UserDesignation.Role;
            }
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
    }
}
