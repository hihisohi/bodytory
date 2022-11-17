import Input from "@components/Input";

import { NextPage } from "next";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { ResponseType } from "@libs/server/withHandler";
import Link from "next/link";
import useApi from "@libs/client/useApi";
import { useMutation } from "@tanstack/react-query";
export interface HelpForm {
  email?: string;
  token?: string;
  password?: string;
  passwordConfirm?: string;
}

const HelpPage: NextPage = () => {
  const router = useRouter();
  const { postApi } = useApi("/api/users/help");
  const [email, setEmail] = useState("");
  const [isToken, setIsToken] = useState(false);
  const { mutateAsync } = useMutation(["help"], postApi, {
    onError(error:any) {
      alert(`${error.data}`);
    },
    onSuccess(data) {
      if (isToken) {
        console.log("인증번호 인증 완료");
        router.push(
          {
            pathname: "/users/help/reset",
            query: { email },
          },
          "/users/help/reset",
        );
      }
      setIsToken(true);
    },
  });
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<HelpForm>();

  const onValid = (helpForm: HelpForm) => {
    setEmail(helpForm?.email!);
    console.log(helpForm);
    mutateAsync(helpForm);
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onValid)}>
        <Input
          name={"email"}
          label="이메일"
          register={register("email", {
            required: "이메일를 입력해주세요.",
            // pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i, message: "올바른 이메일 형식이 아닙니다." },
          })}
          placeholder="이메일를 입력해주세요."
          errorMessage={errors.email?.message}
        />
        {isToken && (
          <Input
            name="token"
            label="인증번호"
            register={register("token", {
              required: "인증번호를 입력해주세요.",
            })}
            placeholder="인증번호를 입력해주세요."
            errorMessage={errors.token?.message}
          />
        )}

        <button>{isToken ? "인증번호 확인" : "이메일 인증"}</button>
      </form>
    </div>
  );
};
export default HelpPage;
