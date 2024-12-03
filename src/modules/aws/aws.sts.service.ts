import { HttpException, Injectable } from '@nestjs/common';
import { AwsQueryBuilder } from './aws.query.builder';
import { AssumeRoleCommand, STSClient } from '@aws-sdk/client-sts';
import { AssumeRoleRequestDto } from './dto/request.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AwsStsService {
  private stsClient: STSClient;
  constructor(
    private readonly awsQueryBuilder: AwsQueryBuilder,
    private readonly configService: ConfigService,
  ) {
    this.stsClient = new STSClient({
      region: this.configService.get<string>('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get<string>(
          'AWS_SECRET_ACCESS_KEY',
        ),
      },
    });
  }

  /**
   * Assumes an IAM role and retrieves temporary security credentials.
   *
   * @param assumeRoleRequestDto - Data transfer object containing role details
   * @returns Temporary security credentials.
   * @throws HttpException if there is an error from the AWS SDK.
   */
  async assumeRole(assumeRoleRequestDto: AssumeRoleRequestDto): Promise<any> {
    const { role_arn, session_name, duration_in_seconds } =
      assumeRoleRequestDto;
    try {
      const assumeRoleCommand = new AssumeRoleCommand({
        RoleArn: role_arn,
        RoleSessionName: session_name,
        DurationSeconds: duration_in_seconds,
        // PolicyArns: [{ arn: 'arn:aws:iam::aws:policy/AmazonEC2FullAccess' }], // We can pass extra policy by policyArn and policy document
        // Policy: 'Policy document',
      });

      return await this.stsClient.send(assumeRoleCommand);
    } catch (error) {
      throw new HttpException(error, error.$metadata.httpStatusCode);
    }
  }

  /**
   * Generates a temporary AWS Management Console login URL using assumed role credentials.
   *
   * @param roleArn - The ARN of the IAM role to assume.
   * @param sessionName - A unique name for the session.
   * @param externalId - A unique identifier to differentiate between entities (optional).
   * @param durationSeconds - The duration of the session in seconds (default: 3600; max: 43200).
   * @returns A URL for temporary console access.
   * @throws HttpException if there is an error from the AWS SDK or during URL generation.
   */
  async getTemporaryConsoleAccess(
    roleArn: string,
    sessionName: string,
    externalId: string,
    durationSeconds: number,
  ): Promise<string> {
    try {
      //Assume role
      const assumeRoleCommand = new AssumeRoleCommand({
        RoleArn: roleArn,
        RoleSessionName: sessionName,
        ExternalId: externalId, //Optional, useful in cross-account scenarios.
        DurationSeconds: durationSeconds, // Duration of the session (max: 12 hours)
      });

      const response = await this.stsClient.send(assumeRoleCommand);

      const { AccessKeyId, SecretAccessKey, SessionToken } =
        response.Credentials;

      // Generate AWS console federation URL
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
      throw new HttpException(error, error.$metadata.httpStatusCode);
    }
  }
}
