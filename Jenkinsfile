pipeline {
    agent any

    environment {
        PATH = "/usr/local/bin:$PATH"
        APP_HOME = "${WORKSPACE}"
        FE_SERVICE_1 = "HE_SERVICE_1"
        FE_SERVICE_2 = "HE_SERVICE_2"

        PIPELINE_ERROR = ""   // tempat menyimpan error log
    }

    stages {

        stage("Checkout") {
            steps {
                git branch: 'main',
                    url: 'git@github.com:FAJRIKUN-MAKALALAG/health-buddy-ai.git',
                    credentialsId: 'GITHUB_KEY'
            }
        }

        stage("Debug Env Jenkins") {
            steps {
                sh '''
                    echo ">> Whoami:"
                    whoami
                    echo ">> PATH:"
                    echo $PATH
                    echo ">> Node version:"
                    node -v || true
                    npm -v || true
                '''
            }
        }

        stage("Setup ENV") {
            steps {
                withCredentials([file(credentialsId: 'HEALTHY_BUDDY', variable: 'ENVFILE')]) {
                    sh """
                        cp \$ENVFILE ${APP_HOME}/.env
                        chmod 600 ${APP_HOME}/.env
                    """
                }
            }
        }

        stage("Build Aplikasi") {
            steps {
                script {
                    try {
                        sh """
                            cd ${APP_HOME}
                            rm -rf .next
                            npm ci
                            npm run buil
                        """
                        echo "✅ Build berhasil!"

                    } catch (err) {
                        echo "❌ Build gagal"
                        
                        // Simpan error agar bisa dikirim via WhatsApp
                        env.PIPELINE_ERROR = err.getMessage().take(500)

                        currentBuild.result = 'FAILURE'
                        error("Build gagal: ${err}")
                    }
                }
            }
        }

        stage("Generate Sitemap") {
            when { expression { currentBuild.result == null || currentBuild.result == 'SUCCESS' } }
            steps {
                sh """
                    cd ${APP_HOME}
                    echo "🧹 Menghapus sitemap lama..."
                    rm -f dist/sitemap*.xml public/robots.txt || true
                """
            }
        }

        stage("Clean Unused Files") {
            when { expression { currentBuild.result == null || currentBuild.result == 'SUCCESS' } }
            steps {
                sh """
                    echo "🧹 Membersihkan file tidak digunakan..."
                    cd ${APP_HOME}
                    rm -rf src components lib types
                    rm -f tsconfig.json next-env.d.ts eslint.config.mjs README.md components.json Jenkinsfile
                    echo "📁 Struktur folder sekarang:"
                    ls -lah
                """
            }
        }

        stage("Deploy Aplikasi") {
            when { expression { currentBuild.result == null || currentBuild.result == 'SUCCESS' } }
            steps {
                sh """
                    # FE 1
                    pm2 describe ${FE_SERVICE_1} > /dev/null \
                        && pm2 restart ${FE_SERVICE_1} \
                        || PORT=3001 pm2 start "npm run preview" --name ${FE_SERVICE_1}

                    # FE 2
                    pm2 describe ${FE_SERVICE_2} > /dev/null \
                        && pm2 restart ${FE_SERVICE_2} \
                        || PORT=3005 pm2 start "npm run preview" --name ${FE_SERVICE_2}

                    pm2 save
                    pm2 status
                """
            }
        }
    }

    post {

        success {
            echo "✅ Pipeline selesai sukses!"

            sh """
                curl -X POST "https://api.fonnte.com/send" \
                -H "Authorization:vXWMuxEo5D22ysUiNJr9" \
                -F "target=6282187199940" \
                -F "message=*BUILD SUKSES!*%0AProject: ${env.JOB_NAME}%0ABuild: #${env.BUILD_NUMBER}%0AStatus: SUCCESS%0ADetail: ${env.BUILD_URL}"
            """
        }

        failure {
                echo "❌ Pipeline gagal!"

                script {
                    // Ambil error dari environment
                    def errorMessage = env.PIPELINE_ERROR ?: "Tidak ada detail error"

                    // Sanitasi untuk aman dikirim via WhatsApp
                    errorMessage = errorMessage.replace('"', "'")

                    // Escape newline agar tidak rusak
                    errorMessage = errorMessage.take(500)
                    
                    // Kirim via Fonnte
                    sh """
                        curl -X POST "https://api.fonnte.com/send" \
                        -H "Authorization:vXWMuxEo5D22ysUiNJr9" \
                        -F "target=6282187199940" \
                        -F "message=*BUILD GAGAL!*%0AProject: ${env.JOB_NAME}%0ABuild: #${env.BUILD_NUMBER}%0AStatus: FAILED%0AError: ${errorMessage}%0ADetail: ${env.BUILD_URL}"
                    """
                }
            }
    }
}
