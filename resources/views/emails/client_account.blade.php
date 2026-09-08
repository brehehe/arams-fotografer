<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Akses Akun Portal Klien - Arams Photography</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #f8fafc;
            color: #1e293b;
            margin: 0;
            padding: 24px;
        }
        .container {
            max-width: 560px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
            border: 1px solid #e2e8f0;
        }
        .header {
            background-color: #1e1b4b;
            background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #31101e 100%);
            padding: 32px 28px;
            text-align: center;
        }
        .header h1 {
            color: #ffffff;
            font-size: 20px;
            font-weight: 800;
            margin: 0;
            letter-spacing: -0.02em;
        }
        .header p {
            color: #cbd5e1;
            font-size: 12px;
            margin-top: 6px;
            margin-bottom: 0;
        }
        .body {
            padding: 28px;
        }
        .greeting {
            font-size: 15px;
            font-weight: 700;
            color: #0f172a;
            margin-bottom: 12px;
        }
        .lead {
            font-size: 13px;
            color: #475569;
            line-height: 1.6;
            margin-bottom: 20px;
        }
        .cred-box {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 16px 20px;
            margin-bottom: 24px;
        }
        .cred-row {
            display: flex;
            margin-bottom: 10px;
            font-size: 13px;
        }
        .cred-row:last-child {
            margin-bottom: 0;
        }
        .cred-label {
            font-weight: 600;
            color: #64748b;
            width: 110px;
            flex-shrink: 0;
        }
        .cred-value {
            font-weight: 700;
            color: #0f172a;
            word-break: break-all;
        }
        .notes-box {
            background-color: #fefce8;
            border-left: 4px solid #eab308;
            padding: 12px 16px;
            border-radius: 4px 8px 8px 4px;
            margin-bottom: 24px;
            font-size: 12px;
            color: #713f12;
            line-height: 1.5;
        }
        .btn-wrapper {
            text-align: center;
            margin-bottom: 24px;
        }
        .btn {
            display: inline-block;
            background-color: #e57a00;
            color: #ffffff !important;
            font-weight: 700;
            font-size: 13px;
            padding: 12px 28px;
            border-radius: 10px;
            text-decoration: none;
            letter-spacing: 0.01em;
        }
        .footer {
            background-color: #f8fafc;
            padding: 20px 28px;
            border-top: 1px solid #e2e8f0;
            text-align: center;
            font-size: 11px;
            color: #94a3b8;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>ARAMS PHOTOGRAPHY</h1>
            <p>Studio &amp; Cinema</p>
        </div>

        <div class="body">
            <div class="greeting">Halo Kak {{ $clientName }},</div>
            <div class="lead">
                Akun akses portal klien Anda telah siap. Melalui portal ini, Anda dapat memantau status project, melakukan kurasi dan review foto/video, serta mengunduh seluruh file dokumentasi Anda.
            </div>

            <div class="cred-box">
                <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                    <tr>
                        <td style="padding: 6px 0; color: #64748b; font-weight: 600; width: 110px;">🌐 Link Portal</td>
                        <td style="padding: 6px 0; color: #0f172a; font-weight: 700;">
                            <a href="{{ $portalUrl }}" style="color: #4f46e5; text-decoration: underline;">{{ $portalUrl }}</a>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; color: #64748b; font-weight: 600;">👤 Nama Klien</td>
                        <td style="padding: 6px 0; color: #0f172a; font-weight: 700;">{{ $clientName }}</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; color: #64748b; font-weight: 600;">📧 Email</td>
                        <td style="padding: 6px 0; color: #0f172a; font-weight: 700;">{{ $email }}</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; color: #64748b; font-weight: 600;">🔑 Password</td>
                        <td style="padding: 6px 0; color: #0f172a; font-family: monospace; font-weight: 700;">{{ $password }}</td>
                    </tr>
                </table>
            </div>

            @if(!empty($notes))
            <div class="notes-box">
                <strong>Catatan Tim Studio:</strong><br>
                {{ $notes }}
            </div>
            @endif

            <div class="btn-wrapper">
                <a href="{{ $portalUrl }}" class="btn" target="_blank">Login ke Portal Klien</a>
            </div>

            <p style="font-size: 11px; color: #64748b; text-align: center; margin: 0;">
                Harap simpan kredensial ini dengan baik. Demi keamanan, Anda dapat mengganti password Anda setelah berhasil login.
            </p>
        </div>

        <div class="footer">
            &copy; {{ date('Y') }} Arams Photography. All rights reserved.
        </div>
    </div>
</body>
</html>
