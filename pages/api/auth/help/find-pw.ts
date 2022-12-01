import type { NextApiRequest, NextApiResponse } from "next";
import client from "utils/server/client";
import withHandler from "@utils/server/withHandler";
import { withApiSession } from "@utils/server/withSession";
import { HelpForm } from "pages/auth/help/find-pw";
import { getPayload } from "@utils/client/payload";
import sendMail from "@utils/server/sendMail";

const checkId = async (accountId: string) => {
  const foundUser = await client.user.findFirst({
    where: {
      accountId,
      type: "origin",
    },
  });

  if (!foundUser) throw new Error("아이디를 확인해주세요");

  return foundUser;
};

const createToken = async (accountId: string) => {
  const foundUser = await checkId(accountId);
  const payload = getPayload();

  await client.certification.deleteMany({
    where: { user: { id: foundUser.id } },
  });

  await client.certification.create({
    data: {
      number: payload,
      user: {
        connect: {
          id: foundUser.id,
        },
      },
    },
  });
  console.log(payload);
  sendMail(foundUser.email, payload, "비밀번호 찾기");

  return { email: foundUser.email };
};

const checkToken = async (accountId: string, token: string) => {
  const findToken = await client.certification.deleteMany({
    where: {
      number: token,
      user: {
        accountId,
      },
    },
  });

  if (findToken.count <= 0) throw new Error("인증번호를 확인해주세요");
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { token, accountId }: HelpForm = req.body;
  if (!accountId) return res.status(400).end();

  if (!token) {
    try {
      const { email } = await createToken(accountId);
      res.status(200).json({ email, accountId });
    } catch (error) {
      console.log(error);
      const errorMessage = error instanceof Error ? error.message : (<Object>error).toString();
      res.status(403).send(errorMessage);
    }
  }

  if (token) {
    try {
      await checkToken(accountId, token);
      res.status(200).send({ ok: true });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : (<Object>error).toString();
      res.status(403).send(errorMessage);
    }
  }
}

export default withApiSession(withHandler({ methods: ["POST"], handler, isPrivate: false }));
