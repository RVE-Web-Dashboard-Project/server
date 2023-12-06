interface LoginParams {
    username: string;
    password: string;
}

interface ChangePasswordParams {
    oldPassword: string;
    newPassword: string;
}

interface DeleteMyAccountParams {
    password: string;
}
