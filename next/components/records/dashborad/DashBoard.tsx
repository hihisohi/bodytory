import styled from "styled-components";
import { ToryText26 } from "@styles/Common";
import DashBoardStatistics from "./DashBoardStatistics";
import ToryRecommend from "../ToryRecommend";
import useUser from "@hooks/useUser";
import customApi from "@utils/client/customApi";
import { useQuery } from "@tanstack/react-query";
import { AI_RESULT_READ } from "constant/queryKeys";
import { KoreanPosition } from "types/write";
import { Position } from "@prisma/client";
import ChartAnim from "@components/lotties/ChartAnim";
import MicIcon from "@src/assets/icons/mic.svg";
import Link from "next/link";
import { useEffect, useState } from "react";
import { RoundedDefaultButton } from "@components/layout/buttons/DefaultButtons";
import ToryWhiteAnim from "@components/lotties/ToryWhiteAnim";
import { media } from "@styles/theme";

interface AMonthResponse {
  mostInAMonth: Position[];
  mostThreeDepartment: string[];
}

function DashBoard() {
  const { user } = useUser();
  const { getApi } = customApi(`/api/users/records/dashboard/aMonth`);
  const { data, isFetching } = useQuery<AMonthResponse | undefined>([AI_RESULT_READ], getApi);

  const [toryMotionIdx, setToryMotionIdx] = useState<number>(2);

  useEffect(() => {
    setTimeout(() => {
      setToryMotionIdx(0);
    }, 2200);
  }, []);

  return user ? (
    <DashBoardWarp>
      <DashBoardContainer>
        {isFetching || (
          <>
            <ToryTextBox>
              <ToryMotion>
                <ToryWhiteAnim segmentIndex={toryMotionIdx} />
              </ToryMotion>
              <ToryText26White>
                <>
                  {data &&
                    data.mostInAMonth.length !== 0 &&
                    (data.mostInAMonth.length > 3 ? (
                      <>
                        <strong>{user?.name}님</strong>, 최근 한달동안 증상 기록이 많아졌네요.. <br />
                        토리랑 함께 건강관리에 힘써봐요!
                      </>
                    ) : (
                      <>
                        <strong>{user?.name}님</strong>, 최근 한달간{" "}
                        <strong>{data.mostInAMonth.map(ele => KoreanPosition[ele]).join(", ")}</strong>에서 증상이 많이
                        발생하셨네요
                      </>
                    ))}
                  {data && data.mostInAMonth.length === 0 && (
                    <>
                      아직 분석할 기록이 없어요.. <br />
                      <strong>{user?.name}님</strong>의 몸 상태를 알려주시면 토리가 분석해드릴게요!
                    </>
                  )}
                </>
              </ToryText26White>
            </ToryTextBox>
            {data && data.mostInAMonth.length !== 0 && (
              <>
                <ToryRecommend mostThreeDepartment={data?.mostThreeDepartment} inChart={false} />
                <DashBoardStatistics />
              </>
            )}
            {data && data.mostInAMonth.length === 0 && (
              <>
                <NoChartContainer>
                  <ChartAnim />
                </NoChartContainer>
                <NoChartButtonContainer>
                  <p>오늘부터 매일매일 내 몸을 위한 건강한 기록을 시작해볼까요?</p>
                  <Link href={"/users/records/write"}>
                    <RoundedDefaultButton img>
                      <SmallMicIcon />
                      오늘 기록하기
                    </RoundedDefaultButton>
                  </Link>
                </NoChartButtonContainer>
              </>
            )}
          </>
        )}
      </DashBoardContainer>
    </DashBoardWarp>
  ) : null;
}

const DashBoardWarp = styled.div`
  width: 100%;
  height: 100%;
  background: ${({ theme }) => theme.color.darkBg};
`;

const DashBoardContainer = styled.div`
  width: 100%;
  max-width: 1200px;
  height: 100%;
  margin: 0 auto;
  padding: 30px 60px;

  ${media.custom(1520)} {
    padding: 30px;
  }

  ${media.mobile} {
    padding: 30px 20px 0;
  }
`;

const ToryTextBox = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding: 32px 0px 32px 140px;
  word-break: keep-all;

  ${media.custom(1280)} {
    padding: 22px 0px 22px 120px;
  }

  ${media.mobile} {
    padding: 90px 0 0;
    justify-content: center;
    text-align: center;
  }
`;

const ToryMotion = styled.div`
  position: absolute;
  top: 50%;
  left: 0;
  transform: translate(-15%, -65%);
  width: 170px;
  height: 170px;

  ${media.custom(1280)} {
    width: 150px;
    height: 150px;
  }

  ${media.mobile} {
    width: 120px;
    height: 120px;
    top: 0;
    left: 50%;
    transform: translate(-50%, -36%);
  }
`;

const ToryText26White = styled(ToryText26)`
  color: ${({ theme }) => theme.color.white};
`;

const NoChartContainer = styled.div`
  width: 100%;
  background: ${({ theme }) => theme.color.white};
  border-radius: 40px;
  margin-top: 50px;
  padding: 20px 60px;
`;

const NoChartButtonContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  background: ${({ theme }) => theme.color.white};
  border-radius: 40px;
  margin-top: 20px;
  padding: 40px 80px;
  font-size: 20px;
  font-weight: 700;
`;

const SmallMicIcon = styled(MicIcon)`
  width: 30px;
  height: 30px;
  margin-right: 15px;
`;

export default DashBoard;
