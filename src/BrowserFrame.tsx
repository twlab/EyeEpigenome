
export default function BrowserFrame({hubId}) {
        const url = `https://epigenomegateway.wustl.edu/browser/?genome=hg38&hub=https://hcwxisape8.execute-api.us-east-1.amazonaws.com/dev/datahub/${hubId}`;
            return (
                <iframe title="eg-react" src={`${url}`} style={{ width: '100vw', height: '100vh' }}></iframe>
            )
    }