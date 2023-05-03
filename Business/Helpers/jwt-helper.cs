using Microsoft.AspNetCore.Http;
using Microsoft.Net.Http.Headers;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Net.Http.Headers;

namespace ChatApp.Business.Helpers
{
    public class JwtHelper
    {
        public static string GetUsernameFromRequest(HttpRequest httpRequest)
        {
            var authorization = httpRequest.Headers[HeaderNames.Authorization];
            var username = "";
            if (AuthenticationHeaderValue.TryParse(authorization, out var headerValue))
            {
                var parameter = headerValue.Parameter;

                var handler = new JwtSecurityTokenHandler();
                var jsonToken = handler.ReadJwtToken(parameter);

                var tokenS = jsonToken as JwtSecurityToken;

                username = tokenS.Claims.First(claim => claim.Type == "sub").Value;
            }

            return username;
        }
        public static string GetRoleFromRequest(HttpRequest httpRequest)
        {
            var authorization = httpRequest.Headers[HeaderNames.Authorization];
            var role = "";
            if (AuthenticationHeaderValue.TryParse(authorization, out var headerValue))
            {
                var parameter = headerValue.Parameter;

                var handler = new JwtSecurityTokenHandler();
                var jsonToken = handler.ReadJwtToken(parameter);

                var tokenS = jsonToken as JwtSecurityToken;

                role = tokenS.Claims.First(claim => claim.Type == ClaimsConstant.DesignationClaim).Value;
            }

            return role;
        }

    }
}
