declare module '@mailchimp/mailchimp_marketing' {
    export interface Campaign {
      id: string;
      // other properties of the campaign...
    }
  
    export interface ErrorResponse {
      title: string;
      detail: string;
    }
  
    export interface Campaigns {
      // Define other methods and properties if necessary
      create(data: any): Promise<Campaign | ErrorResponse>;
      setContent(id: string, content: any): Promise<Campaign | ErrorResponse>;
      send(id: string): Promise<Campaign | ErrorResponse>;
    }
  
    const mailchimp: {
      setConfig(config: { apiKey: string; server: string }): void;
      campaigns: Campaigns;
    };
  
    export default mailchimp;
  }
  