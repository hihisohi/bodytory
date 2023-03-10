import Input from "@components/layout/input/Input";
import { GetServerSidePropsContext, NextPage } from "next";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import customApi from "utils/client/customApi";
import { useMutation } from "@tanstack/react-query";
import { UserType } from "@prisma/client";
import { HELP_FIND_PASSWORD } from "constant/queryKeys";
import { ACCOUNT_ID_REGEX } from "constant/regex";
import MessageBox from "@components/MessageBox";
import ButtonInInput from "@components/layout/input/ButtonInInput";
import styled from "styled-components";
import { FlexContainer, InnerContainer } from "@styles/Common";
import { FindForm, Seperation } from "./find-id";
import { RoundedDefaultButton } from "@components/layout/buttons/DefaultButtons";
import withGetServerSideProps from "@utils/client/withGetServerSideProps";
import { useSetRecoilState } from "recoil";
import { accountIdForFindPasswordAtom } from "atoms/atoms";
export interface HelpForm {
  type: UserType;
  accountId?: string;
  email?: string;
  token?: string;
  password?: string;
  passwordConfirm?: string;
}

const HelpPage: NextPage = () => {
  const router = useRouter();
  const { postApi } = customApi("/api/auth/help/find-pw");
  const [_, setEmail] = useState("");
  const setaccountIdForFindPassword = useSetRecoilState(accountIdForFindPasswordAtom);
  const [currentComment, setCurrentComment] = useState("비밀번호를 잊으셨나요?\n가입한 아이디을 알려주세요");
  const [accountId, setAccountId] = useState("");
  const { mutate } = useMutation([HELP_FIND_PASSWORD], postApi, {
    onError(error: any) {
      if (isToken) {
        return setError("token", { message: `${error.data}` });
      }
      setError("accountId", { message: `가입된 아이디가 없어요\n다시 한번 확인해주세요` });
    },
    onSuccess(data) {
      if (isToken) {
        if (data.ok) {
          setaccountIdForFindPassword(accountId);
          return router.push("/auth/help/reset");
        }
        setValue("token", "");
        clearErrors();
        return setCurrentComment("해당 아이디의 이메일로 한번 더 보냈어요!\n인증번호를 확인해주세요");
      }
      setIsToken(true);
      setEmail(data.email);
      setAccountId(data.accountId);
      setCurrentComment("해당 아이디의 이메일로 인증메일을 보냈어요!\n인증번호를 확인해주세요");
    },
  });
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    clearErrors,
    formState: { errors: helpErrors },
  } = useForm<HelpForm>({ mode: "onChange" });
  const [isToken, setIsToken] = useState(false);
  const onValid = (helpForm: HelpForm) => {
    mutate(helpForm);
  };

  const handleClickFindPassword = () => {
    if (!watch("accountId")) return setError("accountId", { message: "아이디를 입력해주세요" });
    if (watch("accountId") && !ACCOUNT_ID_REGEX.test(watch("accountId")!)) {
      return setError("accountId", { message: "아이디 형식에 맞지 않습니다" });
    }
    mutate({ accountId: watch("accountId") });
  };

  const isErrorsMessage = helpErrors.accountId?.message || helpErrors.token?.message;

  useEffect(() => {
    if (!isToken) {
      setCurrentComment("비밀번호를 잊으셨나요?\n가입한 아이디을 알려주세요");
    }
  }, [isToken]);
  return (
    <Container>
      <InnerContainer>
        <MessageBox isErrorsMessage={isErrorsMessage} currentComment={currentComment} />
        <FindForm onSubmit={handleSubmit(onValid)}>
          {isToken || (
            <Seperation>
              <Input
                name="accountId"
                register={register("accountId", {
                  required: true,
                  validate: value => ACCOUNT_ID_REGEX.test(value!) || "아이디 형식에 맞지 않습니다",
                })}
                placeholder="bodytory2022"
                error={helpErrors.accountId}
              />
            </Seperation>
          )}
          <Seperation>
            <RoundedDefaultButton lg type="button" onClick={handleClickFindPassword}>
              {isToken ? "인증메일 다시 보내기" : "비밀번호 찾기"}
            </RoundedDefaultButton>
          </Seperation>
          {isToken && (
            <>
              <Seperation>
                {isToken && (
                  <ButtonInInput
                    name="token"
                    placeholder="인증번호"
                    register={register("token", {
                      required: "인증번호를 입력해주세요",
                      validate: value => /^[0-9]+$/.test(value!) || "숫자만 입력해주세요",
                    })}
                    buttonValue="인증번호 확인"
                    isAuthenticationColumn
                    error={helpErrors.token}
                  />
                )}
              </Seperation>
            </>
          )}
        </FindForm>
      </InnerContainer>
    </Container>
  );
};
export default HelpPage;
export const getServerSideProps = withGetServerSideProps(async (context: GetServerSidePropsContext) => {
  return {
    props: {},
  };
});
const Container = styled(FlexContainer)``;
