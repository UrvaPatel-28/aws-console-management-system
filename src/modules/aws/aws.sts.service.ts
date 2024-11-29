import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AwsQueryBuilder } from './aws.query.builder';
import { AssumeRoleCommand, STSClient } from '@aws-sdk/client-sts';
import { AssumeRoleRequestDto } from './dto/request.dto';

@Injectable()
export class AwsStsService {
  private stsClient: STSClient;
  constructor(private readonly awsQueryBuilder: AwsQueryBuilder) {
    this.stsClient = new STSClient({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }

  async getTemporaryConsoleAccess(
    roleArn: string,
    sessionName: string,
    externalId: string,
  ): Promise<string> {
    try {
      //Assume role
      const command = new AssumeRoleCommand({
        RoleArn: roleArn,
        RoleSessionName: sessionName,
        ExternalId: externalId,
        DurationSeconds: 900, // Duration of the session (max: 12 hours)
      });

      const response = await this.stsClient.send(command);
      if (!response.Credentials) {
        throw new Error('Failed to assume role');
      }

      const { AccessKeyId, SecretAccessKey, SessionToken } =
        response.Credentials;

      //Generate console Url
      const federationUrl = `https://signin.aws.amazon.com/federation`;
      const sessionData = JSON.stringify({
        sessionId: AccessKeyId,
        sessionKey: SecretAccessKey,
        sessionToken: SessionToken,
      });

      // Get a sign-in Token
      const signinTokenResponse = await fetch(
        `${federationUrl}?Action=getSigninToken&Session=${encodeURIComponent(sessionData)}`,
      );
      const signinToken = await signinTokenResponse.json();

      // Generate a console login Url
      const consoleUrl = `${federationUrl}?Action=login&Issuer=YourApp&Destination=${encodeURIComponent(
        'https://console.aws.amazon.com/',
      )}&SigninToken=${signinToken.SigninToken}`;

      return consoleUrl;
    } catch (error) {
      console.log(error);

      throw new HttpException(
        `Error generating temporary console access: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async assumeRole(assumeRoleRequestDto: AssumeRoleRequestDto): Promise<any> {
    const { role_arn, session_name } = assumeRoleRequestDto;
    try {
      const command = new AssumeRoleCommand({
        RoleArn: role_arn,
        RoleSessionName: session_name,
        DurationSeconds: 3600,
      });

      const response = await this.stsClient.send(command);
      console.log(response);

      return {
        accessKeyId: response.Credentials?.AccessKeyId,
        secretAccessKey: response.Credentials?.SecretAccessKey,
        sessionToken: response.Credentials?.SessionToken,
        expiration: response.Credentials?.Expiration,
      };
    } catch (error) {
      throw new Error(`Failed to assume role: ${error.message}`);
    }
  }
}
