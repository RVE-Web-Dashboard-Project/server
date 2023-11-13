interface LoginParams {
    username: string;
    password: string;
}

interface ChangePasswordParams {
    oldPassword: string;
    newPassword: string;
}

interface InviteUserParams {
    username: string;
}

interface AcceptInvitationParams {
    password: string;
}
