using ChatApp.Context.EntityClasses;
using ChatApp.Models.Auth;
using Google.Apis.Auth;

namespace ChatApp.Business.ServiceInterfaces
{
    public interface IProfileService
    {
        Profile CheckPassword(string UserName, out string curSalt);

        Profile RegisterUser(RegisterModel regModel, string salt);

        void ChangePassword(string salt, string NewPassword, Profile User);

        Profile GoogleLogin(GoogleJsonWebSignature.Payload Payload);

        Profile GetUserByUsername(string UserName);

        string GetSalt(int UserId);
    }
}
