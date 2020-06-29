const enterprise = {
    getLogoURL() {
        return '/user/getEnterpriseLogo.do?size=100&t=' + (new Date().getTime());
    }
}

export default enterprise;