import type { NextApiRequest, NextApiResponse } from "next";
import client from "utils/server/client";
import withHandler from "@utils/server/withHandler";
import { withApiSession } from "@utils/server/withSession";

async function handler(req: NextApiRequest, res: NextApiResponse) {

  if (req.method === "GET") return await myClinicList(req, res);

  // if (req.method === "DELETE") return await deleteHospital(req, res);
  
}


async function myClinicList(req: NextApiRequest, res: NextApiResponse) {
  const { user } = req.session;
  if (!user) return res.status(401).send("회원 정보를 확인해주세요");
  const data = await client.user.findFirst({
    where: {
      id : user.id
    },
    select:{
      hospitals:{
        select:{
          hospital:{
            include:{
              records:{
                where:{
                  type:"hospital",
                  userId: user.id
                }
              }
            }
          }
      }
    },
  }
  });
  return res.status(200).json( data?.hospitals );
}

/* async function deleteHospital(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.body;
  await client.user.delete({
    Record:{
            where:{
              type:"hospital",
              userId : user.id
            }
          }
        }
  });
  return res.status(200).end();
} */

export default withApiSession(withHandler({ methods: ["POST", "GET", "PUT", "DELETE"], handler }));