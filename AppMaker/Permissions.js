/**
 * Determines whether the user has specified role.
 * @param {string} roleName - name of the role to check.
 * @return {boolean} true if user has the role.
 */
function hasRole(roleName) {
    return (app.user.roles.indexOf(roleName) > -1);
}
  
  
/**
 * Determines whether the user is admin.
 * @return {boolean} true if user is an admin.
 */
function isAdmin() {
  return hasRole('Admins');
}
