import { UseMutateFunction } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { useCallback, useEffect, useRef, useState } from "react";
import { SocialButton } from "./SocialButton";

export interface SocialBtnProps {
  mutate: UseMutateFunction<any, any, any, unknown>;
  kind: "login" | "register";
}
// https://static.nid.naver.com/js/naveridlogin_js_sdk_2.0.2.js
const NaverLoginBtn = ({ mutate, kind }: SocialBtnProps) => {
  const naverRef = useRef<any>(null);
  const router = useRouter();
  const [comment, _] = useState(kind === "login" ? "로그인" : "회원가입");
  const handleNaverLogin = () => {
    naverRef?.current!.children[0].click();
  };

  const loadedNaverSdk = useCallback(() => {
    const naver = (window as any).naver;
    let naverLogin: any;
    const login = () => {
      naverLogin = new naver.LoginWithNaverId({
        clientId: process.env.NEXT_PUBLIC_NAVER_CLIENT_ID, // ClientID
        callbackUrl: "https://bodytory-ruddy.vercel.app/auth/login/loading", // Callback URL
        isPopup: false, // 팝업 형태로 인증 여부
        loginButton: {
          color: "green", // 색상
          type: 3, // 버튼 크기
          height: "60", // 버튼 높이
        }, // 로그인 버튼 설정
      });

      naverLogin.init();
    };
    const getToken = () => {
      const hash = router.asPath.split("#")[1]; // 네이버 로그인을 통해 전달받은 hash 값
      if (hash) {
        const token = hash.split("=")[1].split("&")[0]; // token값 확인
        localStorage.setItem("naverToken", token);
        naverLogin.getLoginStatus((status: boolean) => {
          // 로그인 상태 값이 있을 경우
          if (status) {
            // 사용자 정보 조회
            const { email, mobile, name, birthyear, gender, id: accountId } = naverLogin.user;
            // 네이버 로그인 요청
            mutate({
              accountId,
              type: "naver",
              email,
              phone: mobile,
              name,
              birth: birthyear,
              gender: gender === "M" ? "male" : "female",
            });
          }
        });
      }
    };
    login();
    getToken();
  }, [mutate, router.asPath]);

  useEffect(() => {
    const naverSdkScript = document.createElement("script");
    naverSdkScript.src = "https://static.nid.naver.com/js/naveridlogin_js_sdk_2.0.2.js";

    document.head.appendChild(naverSdkScript);
    naverSdkScript.addEventListener("load", loadedNaverSdk);
    naverSdkScript.defer = true;
    naverSdkScript.async = true;

    return () => {
      naverSdkScript.removeEventListener("load", loadedNaverSdk);
    };
  }, []);
  return (
    <div>
      <SocialButton onClick={handleNaverLogin} social="naver" sm={kind === "login"}>
        네이버로 {comment}
      </SocialButton>
      <button ref={naverRef} id="naverIdLogin" style={{ display: "none" }} />
    </div>
  );
};
export default NaverLoginBtn;
