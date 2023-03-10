import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import customApi from "utils/client/customApi";
import { USER_WITHDRAW } from "constant/queryKeys";
import Modal from "@components/modals/Modal";
import { BackButton, FlexContainer } from "@styles/Common";
import MessageBox from "@components/MessageBox";
import Input from "@components/layout/input/Input";
import styled from "styled-components";
import { PASSWORD_REGEX } from "constant/regex";
import useUser from "@hooks/useUser";
import { EditButton } from "pages/users";
import { GetServerSidePropsContext, NextPage } from "next";
import withGetServerSideProps from "@utils/client/withGetServerSideProps";
import { media } from "@styles/theme";
import ToryPurpleAnim from "@components/lotties/ToryPurpleAnim";

export interface WithdrawType {
  password: string;
}

const Withdraw: NextPage = () => {
  const router = useRouter();
  const { user } = useUser();
  const [userType, setUserType] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [closingComment, setClosingComment] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const { deleteApi } = customApi("/api/auth/withdraw");
  const { deleteApi: LogoutApi } = customApi("/api/auth/logout");
  const { mutate } = useMutation([USER_WITHDRAW], deleteApi, {
    onError(error: any, variables, context) {
      setShowModal(false);

      setError("password", { message: `비밀번호가 틀렸어요!` });
    },
    onSuccess: data => {
      setClosingComment(true);
    },
  });

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<WithdrawType>({ mode: "onChange" });

  const onValid: SubmitHandler<WithdrawType> = ({ password }) => {
    setCurrentPassword(password);
    setShowModal(true);
  };
  const handleClickOnClose = () => {
    setShowModal(false);
  };
  const handleClickActiveFunction = async () => {
    if (!closingComment) {
      mutate({ password: currentPassword, type: userType });
    } else {
      setShowModal(false);
      localStorage.removeItem("recoil-persist");
      await LogoutApi({});
      router.replace("/auth/login");
    }
  };
  useEffect(() => {
    if (user) {
      setUserType(user.type);
    }
  }, [user]);
  const isErrorsMessage = errors.password?.message;

  return (
    <WithdrawContainer>
      <BackButton onClick={() => router.push("/users")}>
        <span>계정 설정</span>
      </BackButton>
      <Form onSubmit={handleSubmit(onValid)}>
        <ToryMotion>
          <ToryPurpleAnim segmentIndex={3} />
        </ToryMotion>
        <MessageBox
          isErrorsMessage={isErrorsMessage}
          currentComment={`${
            userType === "origin" ? `비밀번호를 입력하고 확인을` : `탈퇴하기를`
          } 누르시면\n회원탈퇴가 진행 됩니다`}
        ></MessageBox>
        {userType === "origin" && (
          <Input
            $light
            type="password"
            register={register("password", {
              required: "회원탈퇴를 하시려면\n비밀번호로 인증 해주셔야해요",
              validate: {
                regexPassword: value =>
                  PASSWORD_REGEX.test(value) || "비밀번호는 6자리 이상\n영문 대소문자, 숫자를 조합해서 입력해주세요",
              },
            })}
            placeholder="••••••"
            error={errors.password}
            motion={false}
          />
        )}
        <ButtonBox>
          <WithdrawButton>탈퇴하기</WithdrawButton>
        </ButtonBox>
      </Form>
      <Modal
        onClose={handleClickOnClose}
        activeFunction={handleClickActiveFunction}
        show={showModal}
        closingComment={closingComment}
      >
        {!closingComment ? (
          <>회원탈퇴를 하시겠습니까?</>
        ) : (
          <>
            회원탈퇴가 성공적으로 완료되었습니다
            <br />
            홈으로 이동합니다
          </>
        )}
      </Modal>
    </WithdrawContainer>
  );
};

export default Withdraw;
export const getServerSideProps = withGetServerSideProps(async (context: GetServerSidePropsContext) => {
  return {
    props: {},
  };
});

const WithdrawButton = styled(EditButton)``;

const WithdrawContainer = styled(FlexContainer)`
  ${media.mobile} {
    align-items: flex start;
  }
`;

const Form = styled.form`
  padding: 40px 0 180px;

  .messageBox {
    color: #232323;
    margin-bottom: 30px;
    font-size: 36px;
  }
  ${media.mobile} {
    .messageBox {
      margin: 0 0 50px;
      font-size: 25px;
    }
  }
`;

const ButtonBox = styled.div`
  margin-top: 50px;
  display: flex;
  button {
    margin: 0 auto;
  }
`;

const ToryMotion = styled.div`
  transform: translate(0, -10%);
  width: 360px;
  height: 360px;
  margin: 0 auto;

  ${media.mobile} {
    width: 260px;
    height: 260px;
  }
`;
